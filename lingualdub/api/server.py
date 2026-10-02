# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Lightweight REST API server for African Voice AI endpoints (OpenAI / ElevenLabs-compatible).

Uses Python standard library http.server, requiring zero additional runtime dependencies.
"""

from __future__ import annotations

import json
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any

from lingualdub.api.routes import SpeechAPIHandler

logger = logging.getLogger(__name__)


class LingualDubRequestHandler(BaseHTTPRequestHandler):
    """
    HTTP Request Handler serving OpenAI / ElevenLabs compatible voice endpoints.
    """

    handler: SpeechAPIHandler = SpeechAPIHandler()

    def _send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, status_code: int, data: dict[str, Any] | list[Any]) -> None:
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_static_file(self, file_path: Path) -> bool:
        if not file_path.is_file():
            return False
        import mimetypes
        mime_type, _ = mimetypes.guess_type(str(file_path))
        mime_type = mime_type or "application/octet-stream"
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mime_type)
        self._send_cors_headers()
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
        return True

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            self._send_json(200, {"status": "ok", "platform": "lingualdub", "version": "0.1.0"})
            return

        if self.path == "/v1/system/probe":
            probe = self.handler.handle_system_probe()
            self._send_json(200, probe)
            return

        if self.path.startswith("/v1/voices"):
            voices = self.handler.handle_list_voices()
            self._send_json(200, {"voices": voices})
            return

        if self.path == "/v1/models" or self.path.startswith("/v1/models?"):
            models = self.handler.handle_list_models()
            self._send_json(200, {"models": models})
            return

        # Serve compiled modern web application (website/dist)
        from pathlib import Path
        dist_dir = Path(__file__).resolve().parent.parent.parent / "website" / "dist"
        if dist_dir.is_dir():
            clean_path = self.path.split("?")[0].lstrip("/")
            candidate = dist_dir / clean_path
            if candidate.is_file():
                self._serve_static_file(candidate)
                return
            # SPA Fallback for client-side routing (/studio, /docs, etc.)
            index_file = dist_dir / "index.html"
            if index_file.is_file():
                self._serve_static_file(index_file)
                return

        self._send_json(404, {"error": "Endpoint not found"})

    def do_POST(self) -> None:  # noqa: N802
        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len) if content_len > 0 else b"{}"

        try:
            payload = json.loads(post_body.decode("utf-8")) if post_body else {}
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON body"})
            return

        if self.path == "/v1/audio/speech":
            try:
                audio_bytes, content_type = self.handler.handle_synthesize_speech(payload)
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self._send_cors_headers()
                self.send_header("Content-Length", str(len(audio_bytes)))
                self.end_headers()
                self.wfile.write(audio_bytes)
            except Exception as exc:
                logger.error("Synthesis failed: %s", exc)
                self._send_json(500, {"error": str(exc)})
            return

        if self.path == "/v1/voices/clone":
            try:
                import base64
                if "audio_base64" in payload:
                    payload["audio_bytes"] = base64.b64decode(payload["audio_base64"])
                res = self.handler.handle_clone_voice(payload)
                self._send_json(200, res)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if self.path == "/v1/agent/converse":
            try:
                res = self.handler.handle_agent_converse(payload)
                self._send_json(200, res)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if self.path == "/v1/translate":
            try:
                res = self.handler.handle_translate(payload)
                self._send_json(200, res)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if self.path == "/v1/studio/master":
            try:
                res = self.handler.handle_studio_master(payload)
                self._send_json(200, res)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if self.path == "/v1/models/pull":
            try:
                res = self.handler.handle_pull_model(payload)
                self._send_json(200, res)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if self.path == "/v1/models/remove":
            try:
                res = self.handler.handle_remove_model(payload)
                self._send_json(200, res)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        self._send_json(404, {"error": "Endpoint not found"})


def create_server(host: str = "127.0.0.1", port: int = 8000) -> HTTPServer:
    """Create a configured LingualDub HTTPServer instance."""
    return HTTPServer((host, port), LingualDubRequestHandler)

