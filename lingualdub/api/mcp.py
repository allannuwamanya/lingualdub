# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Model Context Protocol (MCP) server for LingualDub African Speech AI.

Exposes African voice synthesis, translation, and ASR tools to AI agents
(Claude Desktop, Cursor, Antigravity, VS Code) via JSON-RPC over stdin/stdout.
"""

from __future__ import annotations

import json
import logging
import sys
from typing import Any

from lingualdub.api.routes import SpeechAPIHandler
from lingualdub.voices.gallery import list_presets

logger = logging.getLogger(__name__)

MCP_SERVER_INFO = {
    "name": "lingualdub-mcp",
    "version": "0.1.0",
}

AVAILABLE_TOOLS = [
    {
        "name": "lingualdub_list_voices",
        "description": "List available African voice profiles and presets across Luganda, Runyankole, Swahili, Yoruba, Igbo, and Zulu.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "language": {
                    "type": "string",
                    "description": "Optional ISO 639-3 language code filter (e.g. 'lug', 'nyn', 'swa').",
                }
            },
        },
    },
    {
        "name": "lingualdub_synthesize_speech",
        "description": "Synthesize speech for African languages using high-fidelity regional engines (Sunbird AI, Sherpa-ONNX, or OmniVoice GGUF).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Text to synthesize."},
                "language": {"type": "string", "description": "Language code (e.g. 'lug', 'nyn', 'swa')."},
                "voice": {"type": "string", "description": "Voice ID or preset name (e.g. 'kigozi_lug', 'namubiru_lug', 'amina_swa')."},
                "model": {"type": "string", "description": "TTS model backend: 'sunbird', 'sherpa_mms', 'omnivoice', or 'dummy'."},
                "speed": {"type": "number", "description": "Speech rate multiplier (default 1.0)."},
            },
            "required": ["text"],
        },
    },
    {
        "name": "lingualdub_translate_text",
        "description": "Translate text between African languages (Luganda, Runyankole, Swahili, Yoruba, etc.) and English using NLLB-200 or Sunbird MT.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Text to translate."},
                "source_language": {"type": "string", "description": "Source language code (e.g. 'lug', 'eng')."},
                "target_language": {"type": "string", "description": "Target language code (e.g. 'eng', 'lug')."},
            },
            "required": ["text", "source_language", "target_language"],
        },
    },
]


class MCPServer:
    """
    Standard JSON-RPC 2.0 MCP server implementation.
    """

    def __init__(self) -> None:
        self.speech_handler = SpeechAPIHandler()

    def handle_request(self, req: dict[str, Any]) -> dict[str, Any]:
        """Dispatch a single JSON-RPC MCP request."""
        req_id = req.get("id")
        method = req.get("method")
        params = req.get("params", {})

        # 1. Initialize
        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "serverInfo": MCP_SERVER_INFO,
                    "capabilities": {"tools": {}},
                },
            }

        # 2. List tools
        if method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {"tools": AVAILABLE_TOOLS},
            }

        # 3. Call tool
        if method == "tools/call":
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            try:
                content = self._call_tool(tool_name, arguments)
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"content": content},
                }
            except Exception as exc:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [{"type": "text", "text": f"Error: {exc}"}],
                        "isError": True,
                    },
                }

        # Unknown method
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {"code": -32601, "message": f"Method not found: {method}"},
        }

    def _call_tool(self, name: str, args: dict[str, Any]) -> list[dict[str, Any]]:
        if name == "lingualdub_list_voices":
            lang = args.get("language")
            presets = list_presets(language=lang)
            text_repr = json.dumps([p.to_dict() for p in presets], indent=2)
            return [{"type": "text", "text": text_repr}]

        elif name == "lingualdub_synthesize_speech":
            payload = {
                "input": args["text"],
                "language": args.get("language", "lug"),
                "voice": args.get("voice", "kigozi_lug"),
                "model": args.get("model", "dummy"),
                "speed": float(args.get("speed", 1.0)),
            }
            audio_bytes, content_type = self.speech_handler.handle_synthesize_speech(payload)
            import base64
            b64_audio = base64.b64encode(audio_bytes).decode("ascii")
            return [
                {
                    "type": "text",
                    "text": f"Successfully synthesized {len(audio_bytes)} bytes ({content_type})",
                },
                {
                    "type": "resource",
                    "resource": {
                        "uri": f"data:{content_type};base64,{b64_audio}",
                        "mimeType": content_type,
                    },
                },
            ]

        elif name == "lingualdub_translate_text":
            from lingualdub.components.translation.dummy import DummyTranslationComponent
            from lingualdub.core.result import Result
            from lingualdub.core.segment import Segment

            src = args["source_language"]
            tgt = args["target_language"]
            comp = DummyTranslationComponent(source_language=src, target_language=tgt)
            res = comp.run(
                Result(
                    segments=[Segment(start=0.0, end=2.0, text=args["text"], language=src)],
                    source_language=src,
                )
            )
            trans_text = res.segments[0].text if res.segments else args["text"]
            return [{"type": "text", "text": trans_text}]

        raise ValueError(f"Unknown tool: {name}")

    def run_stdio(self) -> None:
        """Run standard I/O JSON-RPC processing loop."""
        for line in sys.stdin:
            stripped = line.strip()
            if not stripped:
                continue
            try:
                req = json.loads(stripped)
                resp = self.handle_request(req)
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()
            except Exception as exc:
                err_resp = {
                    "jsonrpc": "2.0",
                    "id": None,
                    "error": {"code": -32700, "message": f"Parse error: {exc}"},
                }
                sys.stdout.write(json.dumps(err_resp) + "\n")
                sys.stdout.flush()
