# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from lingualdub.models.manager import ModelManager


@pytest.fixture
def temp_manager(tmp_path: Path) -> ModelManager:
    return ModelManager(cache_dir=tmp_path / "models_cache")


def test_manager_init_and_paths(temp_manager: ModelManager):
    assert temp_manager.cache_dir.is_dir()
    assert not temp_manager.is_downloaded("sherpa_mms_lug")
    assert temp_manager.get_model_path("sherpa_mms_lug") is None


def test_manager_is_downloaded_true_when_files_present(temp_manager: ModelManager):
    model_dir = temp_manager.cache_dir / "sherpa_mms" / "lug"
    model_dir.mkdir(parents=True, exist_ok=True)
    (model_dir / "model.onnx").write_bytes(b"dummy_onnx_bytes")
    (model_dir / "tokens.txt").write_text("a 0\nb 1\n")

    assert temp_manager.is_downloaded("sherpa_mms_lug")
    assert temp_manager.get_model_path("sherpa_mms_lug") == model_dir
    assert temp_manager.find_mms_model_for_language("lug") == model_dir
    assert temp_manager.get_installed_size_bytes("sherpa_mms_lug") > 0


def test_manager_get_model_status(temp_manager: ModelManager):
    status = temp_manager.get_model_status("sherpa_mms_lug")
    assert status["model_id"] == "sherpa_mms_lug"
    assert status["is_downloaded"] is False
    assert status["family"] == "sherpa_mms"
    assert status["size_mb"] == 35.0

    with pytest.raises(KeyError):
        temp_manager.get_model_status("nonexistent")


def test_manager_list_models_filters(temp_manager: ModelManager):
    all_models = temp_manager.list_models()
    assert len(all_models) >= 8

    mms_only = temp_manager.list_models(family="sherpa_mms")
    assert all(m["family"] == "sherpa_mms" for m in mms_only)

    tts_only = temp_manager.list_models(task="tts")
    assert all(m["task"] == "tts" for m in tts_only)

    lug_models = temp_manager.list_models(language="lug")
    assert any(m["model_id"] == "sherpa_mms_lug" for m in lug_models)


def test_manager_delete(temp_manager: ModelManager):
    model_dir = temp_manager.cache_dir / "sherpa_mms" / "lug"
    model_dir.mkdir(parents=True, exist_ok=True)
    (model_dir / "model.onnx").write_bytes(b"data")

    assert temp_manager.is_downloaded("sherpa_mms_lug") is False  # tokens.txt missing
    assert temp_manager.delete("sherpa_mms_lug") is True
    assert not model_dir.exists()
    assert temp_manager.delete("sherpa_mms_lug") is False


@patch("lingualdub.models.downloader.download_model_file")
def test_manager_download_success(mock_download_file: MagicMock, temp_manager: ModelManager):
    def fake_download(repo_id, file_spec, target_dir, progress_callback=None, timeout=60):
        target_dir.mkdir(parents=True, exist_ok=True)
        dest = target_dir / file_spec.filename
        dest.write_text("dummy_content")
        return dest

    mock_download_file.side_effect = fake_download
    path = temp_manager.download("sherpa_mms_lug")

    assert path.is_dir()
    assert (path / "model.onnx").is_file()
    assert (path / "tokens.txt").is_file()
    assert temp_manager.is_downloaded("sherpa_mms_lug") is True


def test_manager_download_unknown_model(temp_manager: ModelManager):
    with pytest.raises(KeyError):
        temp_manager.download("invalid_model_123")
