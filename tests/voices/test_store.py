# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for VoiceStore.
"""

from lingualdub.voices.pack import VoicePack
from lingualdub.voices.store import VoiceStore


def test_voice_store_save_get_delete(tmp_path):
    store = VoiceStore(root_dir=tmp_path)

    pack1 = VoicePack.create(
        voice_id="voice_1",
        name="Voice One",
        audio_path_or_bytes=b"RIFFvoiceone",
        primary_language="lug",
        consent_basis="consent_1",
        gender="female",
        style_tags=["warm"],
    )

    pack2 = VoicePack.create(
        voice_id="voice_2",
        name="Voice Two",
        audio_path_or_bytes=b"RIFFvoicetwo",
        primary_language="swa",
        consent_basis="consent_2",
        gender="male",
        style_tags=["news"],
    )

    store.save(pack1)
    store.save(pack2)

    # Retrieval
    retrieved = store.get("voice_1")
    assert retrieved is not None
    assert retrieved.name == "Voice One"
    assert retrieved.primary_language == "lug"

    # List filtering
    lug_voices = store.list_voices(language="lug")
    assert len(lug_voices) == 1
    assert lug_voices[0].voice_id == "voice_1"

    news_voices = store.list_voices(tag="news")
    assert len(news_voices) == 1
    assert news_voices[0].voice_id == "voice_2"

    female_voices = store.list_voices(gender="female")
    assert len(female_voices) == 1
    assert female_voices[0].voice_id == "voice_1"

    # Deletion
    assert store.delete("voice_1") is True
    assert store.get("voice_1") is None
    assert len(store.list_voices()) == 1


def test_voice_store_find_closest(tmp_path):
    store = VoiceStore(root_dir=tmp_path)

    pack = VoicePack.create(
        voice_id="target_voice",
        name="Target Voice",
        audio_path_or_bytes=b"RIFFtargetaudio",
        primary_language="lug",
        consent_basis="consent_target",
    )
    store.save(pack)

    match = store.find_closest(pack.embedding)
    assert match is not None
    matched_pack, score = match
    assert matched_pack.voice_id == "target_voice"
    assert score > 0.99
