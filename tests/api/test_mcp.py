# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for Model Context Protocol (MCP) server.
"""

from lingualdub.api.mcp import MCPServer


def test_mcp_initialize():
    server = MCPServer()
    req = {
        "jsonrpc": "2.0",
        "id": "req-1",
        "method": "initialize",
        "params": {},
    }
    resp = server.handle_request(req)
    assert resp["jsonrpc"] == "2.0"
    assert resp["id"] == "req-1"
    assert resp["result"]["serverInfo"]["name"] == "lingualdub-mcp"
    assert "tools" in resp["result"]["capabilities"]


def test_mcp_tools_list():
    server = MCPServer()
    req = {
        "jsonrpc": "2.0",
        "id": "req-2",
        "method": "tools/list",
        "params": {},
    }
    resp = server.handle_request(req)
    assert resp["jsonrpc"] == "2.0"
    tools = resp["result"]["tools"]
    tool_names = [t["name"] for t in tools]
    assert "lingualdub_list_voices" in tool_names
    assert "lingualdub_synthesize_speech" in tool_names
    assert "lingualdub_translate_text" in tool_names


def test_mcp_tool_call_list_voices():
    server = MCPServer()
    req = {
        "jsonrpc": "2.0",
        "id": "req-3",
        "method": "tools/call",
        "params": {
            "name": "lingualdub_list_voices",
            "arguments": {"language": "lug"},
        },
    }
    resp = server.handle_request(req)
    assert resp["jsonrpc"] == "2.0"
    content = resp["result"]["content"]
    assert len(content) == 1
    assert "kigozi_lug" in content[0]["text"]


def test_mcp_tool_call_synthesize_speech():
    server = MCPServer()
    req = {
        "jsonrpc": "2.0",
        "id": "req-4",
        "method": "tools/call",
        "params": {
            "name": "lingualdub_synthesize_speech",
            "arguments": {
                "text": "Oli otya nnyabo",
                "language": "lug",
                "voice": "kigozi_lug",
                "model": "dummy",
            },
        },
    }
    resp = server.handle_request(req)
    assert resp["jsonrpc"] == "2.0"
    content = resp["result"]["content"]
    assert any("Successfully synthesized" in item.get("text", "") for item in content)
    assert any(item.get("type") == "resource" for item in content)


def test_mcp_tool_call_translate():
    server = MCPServer()
    req = {
        "jsonrpc": "2.0",
        "id": "req-5",
        "method": "tools/call",
        "params": {
            "name": "lingualdub_translate_text",
            "arguments": {
                "text": "Hello world",
                "source_language": "eng",
                "target_language": "lug",
            },
        },
    }
    resp = server.handle_request(req)
    assert resp["jsonrpc"] == "2.0"
    content = resp["result"]["content"]
    assert len(content) == 1
    assert len(content[0]["text"]) > 0


def test_mcp_unknown_method():
    server = MCPServer()
    req = {
        "jsonrpc": "2.0",
        "id": "req-6",
        "method": "unknown_function",
        "params": {},
    }
    resp = server.handle_request(req)
    assert "error" in resp
    assert resp["error"]["code"] == -32601
