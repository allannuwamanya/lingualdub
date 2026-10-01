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

    finally:
        server.shutdown()
        server.server_close()
