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
from typing import Any

from lingualdub.api.routes import SpeechAPIHandler

logger = logging.getLogger(__name__)


class LingualDubRequestHandler(BaseHTTPRequestHandler):
    """
    HTTP Request Handler serving OpenAI / ElevenLabs compatible voice endpoints.
    """

    handler: SpeechAPIHandler = SpeechAPIHandler()

    def _send_json(self, status_code: int, data: dict[str, Any] | list[Any]) -> None:
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            self._send_json(200, {"status": "ok", "platform": "lingualdub", "version": "0.1.0"})
            return

        if self.path.startswith("/v1/voices"):
            voices = self.handler.handle_list_voices()
            self._send_json(200, {"voices": voices})
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
                self.send_header("Content-Length", str(len(audio_bytes)))
                self.end_headers()
                self.wfile.write(audio_bytes)
            except Exception as exc:
                logger.error("Synthesis failed: %s", exc)
                self._send_json(500, {"error": str(exc)})
            return

        if self.path == "/v1/voices/clone":
            try:
                # Expects base64 encoded audio_bytes or text representation
                import base64
                if "audio_base64" in payload:
                    payload["audio_bytes"] = base64.b64decode(payload["audio_base64"])
                res = self.handler.handle_clone_voice(payload)
                self._send_json(200, res)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        self._send_json(404, {"error": "Endpoint not found"})


def create_server(host: str = "127.0.0.1", port: int = 8000) -> HTTPServer:
    """Create a configured LingualDub HTTPServer instance."""
    return HTTPServer((host, port), LingualDubRequestHandler)
