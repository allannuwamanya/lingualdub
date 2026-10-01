# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for VoicePack (.afrivoice) specification.
"""

import pytest

from lingualdub.voices.pack import VoiceMetadata, VoicePack, VoicePackError


def test_voice_pack_missing_consent_raises():
    with pytest.raises(VoicePackError, match="lacks a recorded consent_basis"):
        VoicePack(
            metadata=VoiceMetadata(
                voice_id="v1",
                name="Test Voice",
                primary_language="lug",
                consent_basis="",
            ),
            reference_audio_bytes=b"RIFFdummydata",
            embedding=[0.1] * 192,
        )


def test_voice_pack_save_and_load(tmp_path):
    pack = VoicePack.create(
        name="Kato Narrator",
        audio_path_or_bytes=b"RIFFcustomsample123",
        primary_language="lug",
        consent_basis="explicit_written_consent_kato_2026",
        gender="male",
        dialect="Central Luganda",
        style_tags=["narrator", "deep"],
        description="Luganda male narrator voice",
    )

    pack_path = tmp_path / "kato.afrivoice"
    pack.save(pack_path)
    assert pack_path.exists()

    # Load back and verify
    loaded = VoicePack.load(pack_path)
    assert loaded.name == "Kato Narrator"
    assert loaded.primary_language == "lug"
    assert loaded.metadata.gender == "male"
    assert loaded.metadata.dialect == "Central Luganda"
    assert loaded.metadata.consent_basis == "explicit_written_consent_kato_2026"
    assert loaded.reference_audio_bytes == b"RIFFcustomsample123"
    assert len(loaded.embedding) == 192


def test_voice_pack_extract_audio(tmp_path):
    pack = VoicePack.create(
        name="Amina Voice",
        audio_path_or_bytes=b"RIFFaminaspeech",
        primary_language="swa",
        consent_basis="verified_consent_amina",
    )

    extracted_file = pack.extract_reference_audio(target_dir=tmp_path)
    assert extracted_file.exists()
    assert extracted_file.read_bytes() == b"RIFFaminaspeech"


def test_voice_pack_similarity():
    pack = VoicePack.create(
        name="Voice A",
        audio_path_or_bytes=b"RIFFvoicea",
        primary_language="lug",
        consent_basis="consent_a",
    )

    # Identical embedding -> similarity == 1.0
    sim_self = pack.similarity_with(pack.embedding)
    assert pytest.approx(sim_self, abs=1e-5) == 1.0

    # Orthogonal/different embedding -> similarity < 1.0
    different_emb = [-x for x in pack.embedding]
    sim_opposite = pack.similarity_with(different_emb)
    assert pytest.approx(sim_opposite, abs=1e-5) == -1.0


def test_voice_pack_corrupted_file(tmp_path):
    bad_file = tmp_path / "corrupted.afrivoice"
    bad_file.write_bytes(b"not a valid zip file")

    with pytest.raises(VoicePackError, match="Corrupted or invalid"):
        VoicePack.load(bad_file)
