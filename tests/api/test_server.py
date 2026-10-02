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

