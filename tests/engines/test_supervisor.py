# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for SubprocessSupervisor engine process isolation.
"""

import sys
import textwrap

import pytest

from lingualdub.engines.supervisor import (
    SubprocessSupervisor,
    SupervisorError,
    SupervisorTimeoutError,
    WorkerCrashedError,
)

# Inline worker script that listens on stdin and responds on stdout
MOCK_WORKER_SCRIPT = textwrap.dedent("""
    import sys
    import json
    import time

    while True:
        line = sys.stdin.readline()
        if not line:
            break
        data = json.loads(line.strip())
        req_id = data.get("id")
        action = data.get("action")
        payload = data.get("payload", {})

        if action == "ping":
            sys.stdout.write(json.dumps({"id": req_id, "status": "ok", "result": {"pong": True}}) + "\\n")
            sys.stdout.flush()
        elif action == "echo":
            sys.stdout.write(json.dumps({"id": req_id, "status": "ok", "result": payload}) + "\\n")
            sys.stdout.flush()
        elif action == "sleep":
            duration = payload.get("duration", 0.5)
            time.sleep(duration)
            sys.stdout.write(json.dumps({"id": req_id, "status": "ok", "result": {"slept": duration}}) + "\\n")
            sys.stdout.flush()
        elif action == "fail":
            sys.stdout.write(json.dumps({"id": req_id, "status": "error", "error": "intentional failure"}) + "\\n")
            sys.stdout.flush()
        elif action == "crash":
            sys.exit(42)
""")


def test_supervisor_validation():
    with pytest.raises(ValueError, match="Either cmd or module_path"):
        SubprocessSupervisor(cmd=None, module_path=None)


def test_supervisor_ping_and_echo(tmp_path):
    worker_file = tmp_path / "worker.py"
    worker_file.write_text(MOCK_WORKER_SCRIPT)

    supervisor = SubprocessSupervisor(
        cmd=[sys.executable, str(worker_file)],
        default_timeout_seconds=5.0,
    )

    try:
        supervisor.start()
        assert supervisor.is_alive is True

        # Test heartbeat ping
        assert supervisor.ping() is True

        # Test echo action
        res = supervisor.send_request("echo", {"msg": "hello from test"})
        assert res == {"msg": "hello from test"}
    finally:
        supervisor.shutdown()
        assert supervisor.is_alive is False


def test_supervisor_timeout(tmp_path):
    worker_file = tmp_path / "worker.py"
    worker_file.write_text(MOCK_WORKER_SCRIPT)

    supervisor = SubprocessSupervisor(
        cmd=[sys.executable, str(worker_file)],
        default_timeout_seconds=0.2,
    )

    try:
        supervisor.start()
        # Sleep for 1.0 second with 0.2 second timeout -> should timeout
        with pytest.raises(SupervisorTimeoutError, match="timed out"):
            supervisor.send_request("sleep", {"duration": 1.0}, timeout=0.2)
    finally:
        supervisor.shutdown()


def test_supervisor_worker_error(tmp_path):
    worker_file = tmp_path / "worker.py"
    worker_file.write_text(MOCK_WORKER_SCRIPT)

    supervisor = SubprocessSupervisor(
        cmd=[sys.executable, str(worker_file)],
        default_timeout_seconds=5.0,
    )

    try:
        supervisor.start()
        with pytest.raises(SupervisorError, match="intentional failure"):
            supervisor.send_request("fail")
    finally:
        supervisor.shutdown()


def test_supervisor_worker_crash_and_restart(tmp_path):
    worker_file = tmp_path / "worker.py"
    worker_file.write_text(MOCK_WORKER_SCRIPT)

    supervisor = SubprocessSupervisor(
        cmd=[sys.executable, str(worker_file)],
        default_timeout_seconds=5.0,
        max_restarts=2,
    )

    try:
        supervisor.start()
        # Trigger an intentional crash (sys.exit(42))
        with pytest.raises((WorkerCrashedError, SupervisorError)):
            supervisor.send_request("crash")

        # The supervisor should automatically restart the worker on the next request
        res = supervisor.send_request("echo", {"recovered": True})
        assert res == {"recovered": True}
        assert supervisor.restart_count == 1
    finally:
        supervisor.shutdown()
