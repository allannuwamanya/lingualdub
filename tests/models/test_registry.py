# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

from pathlib import Path

from lingualdub.models.registry import (
    MODEL_CATALOG,
    get_model_descriptor,
    list_models_by_family,
    list_models_by_language,
)


def test_model_catalog_entries():
    assert "sherpa_mms_lug" in MODEL_CATALOG
    assert "sherpa_mms_swa" in MODEL_CATALOG
    assert "ct2_nllb" in MODEL_CATALOG
    assert "whisper_tiny" in MODEL_CATALOG
    assert "omnivoice_gguf_q4" in MODEL_CATALOG

    desc = MODEL_CATALOG["sherpa_mms_lug"]
    assert desc.family == "sherpa_mms"
    assert desc.task == "tts"
    assert "lug" in desc.languages
    assert desc.primary_language == "lug"
    assert desc.get_relative_cache_dir() == Path("sherpa_mms") / "lug"
    assert len(desc.files) >= 2


def test_get_model_descriptor():
    assert get_model_descriptor("sherpa_mms_lug") is not None
    assert get_model_descriptor("nonexistent_model") is None


def test_list_models_by_family():
    mms_models = list_models_by_family("sherpa_mms")
    assert len(mms_models) >= 5
    for m in mms_models:
        assert m.family == "sherpa_mms"

    ct2_models = list_models_by_family("ct2_nllb")
    assert len(ct2_models) == 1
    assert ct2_models[0].model_id == "ct2_nllb"


def test_list_models_by_language():
    lug_models = list_models_by_language("lug")
    assert any(m.model_id == "sherpa_mms_lug" for m in lug_models)
    assert any(m.model_id == "ct2_nllb" for m in lug_models)

    swa_models = list_models_by_language("swa")
    assert any(m.model_id == "sherpa_mms_swa" for m in swa_models)


def test_relative_cache_dir():
    nllb = MODEL_CATALOG["ct2_nllb"]
    assert nllb.get_relative_cache_dir() == Path("ct2_nllb")

    whisper = MODEL_CATALOG["whisper_tiny"]
    assert whisper.get_relative_cache_dir() == Path("whisper") / "tiny"

    omni = MODEL_CATALOG["omnivoice_gguf_q4"]
    assert omni.get_relative_cache_dir() == Path("omnivoice")
