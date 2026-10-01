# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Subprocess engine isolation supervisor.

Provides process-isolated execution for heavy neural or native C++/ONNX runtimes
(CTranslate2, Sherpa-ONNX, GGUF/llama.cpp). Isolating engines in dedicated worker
processes prevents memory fragmentation, CUDA OOMs, and native segmentation faults
from crashing the main pipeline process.
"""

from __future__ import annotations

import contextlib
import json
import logging
import subprocess
import sys
import threading
import time
import uuid
from pathlib import Path
from typing import Any

from lingualdub.exceptions import StageExecutionError

logger = logging.getLogger(__name__)


class SupervisorError(StageExecutionError):
    """Base error for subprocess supervisor failures."""


class SupervisorTimeoutError(SupervisorError):
    """Raised when an engine worker does not respond within the timeout period."""


class WorkerCrashedError(SupervisorError):
    """Raised when an engine worker process terminates unexpectedly."""


class SubprocessSupervisor:
    """
    Supervises a worker subprocess communicating via newline-delimited JSON IPC on stdin/stdout.

    Features:
    - Non-blocking asynchronous line reader thread
    - Correlation-ID based request/response dispatch
    - Automatic process crash detection and bounded restart
    - Graceful SIGTERM with SIGKILL escalation on timeout
    """

    def __init__(
        self,
        cmd: list[str] | None = None,
        module_path: str | Path | None = None,
        cwd: str | Path | None = None,
        env: dict[str, str] | None = None,
        default_timeout_seconds: float = 30.0,
        max_restarts: int = 3,
    ) -> None:
        if cmd is None and module_path is None:
            raise ValueError("Either cmd or module_path must be supplied to SubprocessSupervisor")

        if cmd is not None:
            self.cmd = list(cmd)
        else:
            self.cmd = [sys.executable, str(module_path)]

        self.cwd = str(cwd) if cwd else None
        self.env = env
        self.default_timeout_seconds = default_timeout_seconds
        self.max_restarts = max_restarts
        self.restart_count = 0

        self._process: subprocess.Popen[str] | None = None
        self._reader_thread: threading.Thread | None = None
        self._pending_requests: dict[str, tuple[threading.Event, dict[str, Any]]] = {}
        self._lock = threading.Lock()
        self._is_shutting_down = False

    @property
    def is_alive(self) -> bool:
        """Return True if worker process is currently running."""
        return self._process is not None and self._process.poll() is None

    def start(self) -> None:
        """Launch the worker subprocess and reader thread."""
        with self._lock:
            if self.is_alive:
                return
            self._is_shutting_down = False
            self._spawn_process()

    def _spawn_process(self) -> None:
        """Spawn the low-level Popen process and spin up the output reader."""
        try:
            self._process = subprocess.Popen(
                self.cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=self.cwd,
                env=self.env,
                text=True,
                bufsize=1,
            )
        except Exception as exc:
            raise SupervisorError(f"Failed to start supervisor worker command {self.cmd!r}: {exc}") from exc

        self._reader_thread = threading.Thread(
            target=self._reader_loop,
            name=f"SupervisorReader-{self._process.pid}",
            daemon=True,
        )
        self._reader_thread.start()
        logger.debug("Spawned engine supervisor worker [PID %d]: %s", self._process.pid, self.cmd)

    def _reader_loop(self) -> None:
        """Read newline-delimited JSON messages from stdout."""
        proc = self._process
        if proc is None or proc.stdout is None:
            return

        while not self._is_shutting_down and proc.poll() is None:
            line = proc.stdout.readline()
            if not line:
                break
            stripped = line.strip()
            if not stripped:
                continue

            try:
                msg = json.loads(stripped)
            except json.JSONDecodeError:
                logger.warning("Unrecognized stdout from worker PID %d: %s", proc.pid, stripped)
                continue

            req_id = msg.get("id")
            if req_id:
                with self._lock:
                    if req_id in self._pending_requests:
                        event, container = self._pending_requests[req_id]
                        container.update(msg)
                        event.set()

        # Process exited or EOF encountered
        return_code = proc.poll()
        if not self._is_shutting_down:
            logger.warning(
                "Worker process PID %d exited unexpectedly with code %s",
                proc.pid,
                return_code,
            )
            # Wake up all pending requests with error
            with self._lock:
                for _req_id, (event, container) in list(self._pending_requests.items()):
                    container["error"] = f"Worker process crashed (exit code: {return_code})"
                    container["status"] = "error"
                    event.set()

    def send_request(
        self,
        action: str,
        payload: dict[str, Any] | None = None,
        timeout: float | None = None,
    ) -> dict[str, Any]:
        """
        Send a JSON-RPC request to the worker process and wait synchronously for response.

        Args:
            action: Action name (e.g. 'synthesize', 'transcribe', 'ping').
            payload: Parameters to pass to the worker.
            timeout: Timeout in seconds (defaults to self.default_timeout_seconds).

        Returns:
            Dictionary payload from worker response.
        """
        effective_timeout = timeout if timeout is not None else self.default_timeout_seconds

        with self._lock:
            if not self.is_alive:
                if self.restart_count < self.max_restarts and not self._is_shutting_down:
                    self.restart_count += 1
                    logger.info(
                        "Restarting crashed worker (attempt %d/%d)",
                        self.restart_count,
                        self.max_restarts,
                    )
                    self._spawn_process()
                else:
                    raise WorkerCrashedError("Subprocess worker is dead and cannot accept requests.")

            req_id = str(uuid.uuid4())
            event = threading.Event()
            response_container: dict[str, Any] = {}
            self._pending_requests[req_id] = (event, response_container)

            msg = {
                "id": req_id,
                "action": action,
                "payload": payload or {},
            }

            try:
                assert self._process is not None
                assert self._process.stdin is not None
                self._process.stdin.write(json.dumps(msg) + "\n")
                self._process.stdin.flush()
            except Exception as exc:
                self._pending_requests.pop(req_id, None)
                raise WorkerCrashedError(f"Failed writing to worker stdin: {exc}") from exc

        # Wait outside lock
        signaled = event.wait(effective_timeout)

        with self._lock:
            self._pending_requests.pop(req_id, None)

        if not signaled:
            raise SupervisorTimeoutError(
                f"Worker action {action!r} timed out after {effective_timeout:.1f}s"
            )

        if response_container.get("status") == "error":
            err_msg = response_container.get("error", "Unknown worker error")
            raise SupervisorError(f"Worker action {action!r} failed: {err_msg}")

        return response_container.get("result", {})

    def ping(self, timeout: float = 5.0) -> bool:
        """Send a lightweight heartbeat ping to test worker liveness."""
        try:
            res = self.send_request("ping", timeout=timeout)
            return res.get("pong", False) is True
        except Exception:
            return False

    def shutdown(self, timeout: float = 5.0) -> None:
        """Gracefully terminate worker subprocess."""
        with self._lock:
            self._is_shutting_down = True
            proc = self._process
            if proc is None or proc.poll() is not None:
                return

            with contextlib.suppress(Exception):
                proc.terminate()

        # Wait for exit
        t_start = time.time()
        while time.time() - t_start < timeout:
            if proc.poll() is not None:
                break
            time.sleep(0.05)

        if proc.poll() is None:
            logger.warning("Worker PID %d did not terminate gracefully; sending SIGKILL", proc.pid)
            with contextlib.suppress(Exception):
                proc.kill()

        if self._reader_thread and self._reader_thread.is_alive():
            self._reader_thread.join(timeout=1.0)

        logger.debug("Supervisor worker shut down cleanly.")
