# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
LingualDub API and Model Context Protocol (MCP) package.
"""

from __future__ import annotations

from lingualdub.api.mcp import MCPServer
from lingualdub.api.routes import SpeechAPIHandler
from lingualdub.api.server import LingualDubRequestHandler, create_server
from lingualdub.api.streaming import AudioStreamChunk, stream_speech_chunks

__all__ = [
    "SpeechAPIHandler",
    "LingualDubRequestHandler",
    "create_server",
    "MCPServer",
    "AudioStreamChunk",
    "stream_speech_chunks",
]
