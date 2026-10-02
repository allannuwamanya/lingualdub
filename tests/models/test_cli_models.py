# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

from pathlib import Path
from unittest.mock import patch

from lingualdub.cli import main


def test_cli_models_list(capsys):
    rc = main(["models", "list"])
    assert rc == 0
    captured = capsys.readouterr()
    assert "sherpa_mms_lug" in captured.out
    assert "ct2_nllb" in captured.out
    assert "whisper_tiny" in captured.out


def test_cli_models_list_filter(capsys):
    rc = main(["models", "list", "--family", "ct2_nllb"])
    assert rc == 0
    captured = capsys.readouterr()
    assert "ct2_nllb" in captured.out
    assert "sherpa_mms_lug" not in captured.out


def test_cli_models_pull_success(capsys, tmp_path: Path):
    with patch("lingualdub.models.manager.ModelManager.download", return_value=tmp_path / "model"):
        rc = main(["models", "pull", "sherpa_mms_lug"])
        assert rc == 0
        captured = capsys.readouterr()
        assert "Successfully downloaded 'sherpa_mms_lug'" in captured.out


def test_cli_models_pull_with_lang(capsys, tmp_path: Path):
    with patch("lingualdub.models.manager.ModelManager.download", return_value=tmp_path / "model") as mock_dl:
        rc = main(["models", "pull", "sherpa_mms", "--lang", "swa"])
        assert rc == 0
        mock_dl.assert_called_once_with("sherpa_mms_swa")


def test_cli_models_pull_failure(capsys):
    with patch("lingualdub.models.manager.ModelManager.download", side_effect=RuntimeError("Network down")):
        rc = main(["models", "pull", "sherpa_mms_lug"])
        assert rc == 1
        captured = capsys.readouterr()
        assert "Error: Network down" in captured.out


def test_cli_models_remove(capsys):
    with patch("lingualdub.models.manager.ModelManager.delete", return_value=True):
        rc = main(["models", "remove", "sherpa_mms_lug"])
        assert rc == 0
        assert "Successfully deleted" in capsys.readouterr().out

    with patch("lingualdub.models.manager.ModelManager.delete", return_value=False):
        rc = main(["models", "remove", "sherpa_mms_lug"])
        assert rc == 1
        assert "not found in cache" in capsys.readouterr().out


def test_cli_models_path(capsys, tmp_path: Path):
    with patch("lingualdub.models.manager.ModelManager.get_model_path", return_value=tmp_path / "dir"):
        rc = main(["models", "path", "sherpa_mms_lug"])
        assert rc == 0
        assert str(tmp_path / "dir") in capsys.readouterr().out

    with patch("lingualdub.models.manager.ModelManager.get_model_path", return_value=None):
        rc = main(["models", "path", "sherpa_mms_lug"])
        assert rc == 1
        assert "is not downloaded" in capsys.readouterr().out
