# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for SpeechAPIHandler.
"""

import pytest

from lingualdub.api.routes import SpeechAPIHandler
from lingualdub.voices.store import VoiceStore


def test_speech_api_handler_list_voices(tmp_path):
    store = VoiceStore(root_dir=tmp_path)
    handler = SpeechAPIHandler(voice_store=store)

    voices = handler.handle_list_voices()
    assert len(voices) >= 8
    voice_ids = {v["voice_id"] for v in voices}
    assert "kigozi_lug" in voice_ids
    assert "amina_swa" in voice_ids


def test_speech_api_handler_synthesize_empty_input():
    handler = SpeechAPIHandler()
    with pytest.raises(ValueError, match="Input text cannot be empty"):
        handler.handle_synthesize_speech({"input": "   "})


def test_speech_api_handler_synthesize_dummy_wav():
    handler = SpeechAPIHandler()
    audio_bytes, content_type = handler.handle_synthesize_speech({
        "input": "Oli otya nnyabo",
        "voice": "kigozi_lug",
        "model": "dummy",
        "speed": 1.0,
    })
    assert content_type == "audio/wav"
    assert len(audio_bytes) > 44  # WAV header + data
    assert audio_bytes[:4] == b"RIFF"


def test_speech_api_handler_clone_voice(tmp_path):
    store = VoiceStore(root_dir=tmp_path)
    handler = SpeechAPIHandler(voice_store=store)

    res = handler.handle_clone_voice({
        "name": "Custom Speaker",
        "audio_bytes": b"RIFFcustomspeakerwav",
        "language": "lug",
        "consent_basis": "user_signed_consent_doc_442",
        "gender": "male",
    })
    assert res["status"] == "ok"
    assert "voice_id" in res
    assert store.get(res["voice_id"]) is not None
