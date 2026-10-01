# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for curated African voice presets gallery.
"""

import pytest

from lingualdub.voices.gallery import (
    AFRICAN_VOICE_PRESETS,
    get_preset_voice,
    list_presets,
)
from lingualdub.voices.pack import VoicePack


def test_list_presets_all():
    presets = list_presets()
    assert len(presets) == len(AFRICAN_VOICE_PRESETS)
    preset_ids = {p.voice_id for p in presets}
    assert "kigozi_lug" in preset_ids
    assert "namubiru_lug" in preset_ids
    assert "mugisha_nyn" in preset_ids
    assert "amina_swa" in preset_ids
    assert "ade_yor" in preset_ids
    assert "ngozi_ibo" in preset_ids
    assert "zola_zul" in preset_ids


def test_list_presets_filter_language():
    lug_presets = list_presets(language="lug")
    assert len(lug_presets) == 2
    assert all(p.primary_language == "lug" for p in lug_presets)

    swa_presets = list_presets(language="swa")
    assert len(swa_presets) == 2
    assert all(p.primary_language == "swa" for p in swa_presets)


def test_get_preset_voice_success():
    pack = get_preset_voice("kigozi_lug")
    assert isinstance(pack, VoicePack)
    assert pack.name == "Kigozi"
    assert pack.primary_language == "lug"
    assert pack.metadata.gender == "male"
    assert pack.metadata.consent_basis == "curated_public_domain_synthetic_preset"
    assert len(pack.reference_audio_bytes) > 0
    assert len(pack.embedding) == 192


def test_get_preset_voice_invalid_key():
    with pytest.raises(KeyError, match="not found"):
        get_preset_voice("non_existent_preset_voice")
