# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

import urllib.error
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from lingualdub.models.downloader import (
    DownloadError,
    _download_stream,
    download_model,
    download_model_file,
)
from lingualdub.models.registry import ModelDescriptor, ModelFileSpec


def test_download_stream_success(tmp_path: Path):
    dest = tmp_path / "test_file.bin"
    mock_resp = MagicMock()
    mock_resp.headers = {"Content-Length": "10"}
    mock_resp.read.side_effect = [b"12345", b"67890", b""]
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        progress_calls = []
        _download_stream(
            "http://example.com/file",
            dest,
            progress_callback=lambda c, t: progress_calls.append((c, t)),
        )

    assert dest.is_file()
    assert dest.read_bytes() == b"1234567890"
    assert len(progress_calls) >= 2


def test_download_stream_error_url(tmp_path: Path):
    dest = tmp_path / "fail.bin"
    with (
        patch("urllib.request.urlopen", side_effect=urllib.error.URLError("Connection refused")),
        pytest.raises(DownloadError, match="Failed to download"),
    ):
        _download_stream("http://fail.example.com", dest)


def test_download_stream_zero_bytes(tmp_path: Path):
    dest = tmp_path / "zero.bin"
    mock_resp = MagicMock()
    mock_resp.headers = {}
    mock_resp.read.return_value = b""
    mock_resp.__enter__.return_value = mock_resp

    with (
        patch("urllib.request.urlopen", return_value=mock_resp),
        pytest.raises(DownloadError, match="Downloaded 0 bytes"),
    ):
        _download_stream("http://example.com/empty", dest)


def test_download_model_file_already_exists(tmp_path: Path):
    dest_dir = tmp_path / "cached_model"
    dest_dir.mkdir(parents=True)
    existing = dest_dir / "model.onnx"
    existing.write_bytes(b"existing_model")

    file_spec = ModelFileSpec("model.onnx")
    result = download_model_file("fake/repo", file_spec, dest_dir)
    assert result == existing


def test_download_model_full(tmp_path: Path):
    descriptor = ModelDescriptor(
        model_id="test_desc",
        name="Test",
        family="sherpa_mms",
        task="tts",
        languages=["lug"],
        repo_id="test/repo",
        files=[
            ModelFileSpec("req.onnx", required=True),
            ModelFileSpec("opt.txt", required=False),
        ],
        size_mb=10,
        ram_mb=10,
        license="MIT",
        description="test",
    )

    with patch("lingualdub.models.downloader.download_model_file") as mock_df:

        def fake_file(repo_id, file_spec, target_dir, **kwargs):
            dest = target_dir / file_spec.filename
            dest.write_text("ok")
            return dest

        mock_df.side_effect = fake_file
        res_dir = download_model(descriptor, tmp_path)
        assert res_dir.is_dir()
        assert (res_dir / "req.onnx").is_file()
        assert (res_dir / "opt.txt").is_file()


def test_download_model_required_failure(tmp_path: Path):
    descriptor = ModelDescriptor(
        model_id="fail_desc",
        name="Fail",
        family="sherpa_mms",
        task="tts",
        languages=["lug"],
        repo_id="fail/repo",
        files=[ModelFileSpec("missing.onnx", required=True)],
        size_mb=10,
        ram_mb=10,
        license="MIT",
        description="fail",
    )

    with (
        patch(
            "lingualdub.models.downloader.download_model_file", side_effect=RuntimeError("HTTP 404")
        ),
        pytest.raises(DownloadError, match="Failed to download required file"),
    ):
        download_model(descriptor, tmp_path)
