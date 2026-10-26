# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for LingualDub HTTP REST API server.
"""

import json
import threading
import urllib.request

from lingualdub.api.server import create_server


def test_api_server_endpoints():
    # Bind to port 0 to let OS allocate an available port
    server = create_server(host="127.0.0.1", port=0)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    base_url = f"http://127.0.0.1:{port}"

    try:
        # 1. Test /health
        req = urllib.request.Request(f"{base_url}/health")
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            assert data["status"] == "ok"
            assert data["platform"] == "lingualdub"

        # 2. Test /v1/voices
        req = urllib.request.Request(f"{base_url}/v1/voices")
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            assert "voices" in data
            assert len(data["voices"]) > 0

        # 3. Test /v1/audio/speech
        speech_payload = {
            "input": "Wasuze otya nnyabo",
            "voice": "kigozi_lug",
            "model": "dummy",
            "speed": 1.0,
        }
        req = urllib.request.Request(
            f"{base_url}/v1/audio/speech",
            data=json.dumps(speech_payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 200
            assert resp.headers.get("Content-Type") == "audio/wav"
            audio_data = resp.read()
            assert len(audio_data) > 0
            assert audio_data[:4] == b"RIFF"

        # 4. Test /v1/system/probe
        req = urllib.request.Request(f"{base_url}/v1/system/probe")
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            assert "accelerator" in data
            assert "compute_class" in data

        # 5. Test /v1/agent/converse
        agent_payload = {"text": "Oli otya?", "voice_id": "kigozi_lug", "language": "lug"}
        req = urllib.request.Request(
            f"{base_url}/v1/agent/converse",
            data=json.dumps(agent_payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            assert "reply_text" in data
            assert "audio_base64" in data

        # 6. Test /v1/translate
        trans_payload = {"text": "Hello world", "source_language": "eng", "target_language": "lug"}
        req = urllib.request.Request(
            f"{base_url}/v1/translate",
            data=json.dumps(trans_payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            assert "translated_text" in data

        # 7. Test /v1/studio/master
        master_payload = {"samples": [0.05, -0.05, 0.08, -0.08], "target_rms": 0.1}
        req = urllib.request.Request(
            f"{base_url}/v1/studio/master",
            data=json.dumps(master_payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            assert "final_rms" in data

        # 8. Test OPTIONS CORS
        req = urllib.request.Request(f"{base_url}/v1/voices", method="OPTIONS")
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 204
            assert resp.headers.get("Access-Control-Allow-Origin") == "*"

        # 9. Test GET /v1/models
        req = urllib.request.Request(f"{base_url}/v1/models")
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            assert "models" in data
            assert len(data["models"]) > 0
            assert any(m["model_id"] == "sherpa_mms_lug" for m in data["models"])

        # 10. Test POST /v1/models/pull validation
        req = urllib.request.Request(
            f"{base_url}/v1/models/pull",
            data=json.dumps({}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        import pytest

        with pytest.raises(urllib.error.HTTPError) as exc_info:
            urllib.request.urlopen(req, timeout=5)
        assert exc_info.value.code == 400

    finally:
        server.shutdown()
        server.server_close()


def test_rate_limiter_unit():
    from lingualdub.api.server import RateLimiter

    limiter = RateLimiter(max_requests=3, window_sec=1.0)
    ip = "192.168.1.100"

    assert limiter.is_allowed(ip) is True
    assert limiter.is_allowed(ip) is True
    assert limiter.is_allowed(ip) is True
    assert limiter.is_allowed(ip) is False  # 4th request rejected

    # Different IP is unaffected
    assert limiter.is_allowed("192.168.1.101") is True


def test_server_bearer_token_auth(monkeypatch):
    import urllib.error

    import pytest

    monkeypatch.setenv("LINGUALDUB_API_KEY", "secret-token-123")

    server = create_server(host="127.0.0.1", port=0)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{port}"

    try:
        # /health is public
        req = urllib.request.Request(f"{base_url}/health")
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 200

        # /v1/voices without auth header -> 401
        req = urllib.request.Request(f"{base_url}/v1/voices")
        with pytest.raises(urllib.error.HTTPError) as err:
            urllib.request.urlopen(req, timeout=5)
        assert err.value.code == 401

        # /v1/voices with correct Bearer header -> 200
        req = urllib.request.Request(
            f"{base_url}/v1/voices",
            headers={"Authorization": "Bearer secret-token-123"},
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            assert "voices" in data

    finally:
        server.shutdown()
        server.server_close()


def test_server_static_and_unknown_api_routes(monkeypatch, tmp_path):
    import http.client

    from lingualdub.api.server import LingualDubRequestHandler

    dist = tmp_path / "dist"
    dist.mkdir()
    (dist / "index.html").write_text("<!doctype html><title>spa</title>")
    (tmp_path / "secret.txt").write_text("top-secret")
    monkeypatch.setattr(LingualDubRequestHandler, "static_dir", dist)

    server = create_server(host="127.0.0.1", port=0)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    def get(path: str) -> tuple[int, str, bytes]:
        # http.client sends the path verbatim, so "../" segments reach the server
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
        try:
            conn.request("GET", path)
            resp = conn.getresponse()
            return resp.status, resp.getheader("Content-Type") or "", resp.read()
        finally:
            conn.close()

    try:
        # /v1/health is served as JSON (the studio's backend probe calls it)
        status, ctype, body = get("/v1/health")
        assert status == 200
        assert ctype == "application/json"
        assert json.loads(body)["status"] == "ok"

        # Unknown API routes return a JSON 404 rather than the SPA shell
        status, ctype, _ = get("/v1/does-not-exist")
        assert status == 404
        assert ctype == "application/json"

        # Client-side routes still fall back to index.html
        status, _, body = get("/studio")
        assert status == 200
        assert b"spa" in body

        # Path traversal must not escape the static directory
        status, _, body = get("/../secret.txt")
        assert b"top-secret" not in body
    finally:
        server.shutdown()
        server.server_close()


def test_client_ip_ignores_forwarded_header_unless_proxy_trusted(monkeypatch):
    from email.message import Message

    from lingualdub.api.server import LingualDubRequestHandler

    handler = LingualDubRequestHandler.__new__(LingualDubRequestHandler)
    handler.client_address = ("10.0.0.5", 54321)
    handler.headers = Message()
    handler.headers["X-Forwarded-For"] = "1.2.3.4, 203.0.113.9"

    # Untrusted by default: a spoofed header must not change the rate-limit key
    monkeypatch.delenv("LINGUALDUB_TRUST_PROXY", raising=False)
    assert handler._get_client_ip() == "10.0.0.5"

    # Behind a trusted proxy, use the entry that proxy appended (rightmost)
    monkeypatch.setenv("LINGUALDUB_TRUST_PROXY", "1")
    assert handler._get_client_ip() == "203.0.113.9"
