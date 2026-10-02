# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for Sunbird AI client.
"""

import io
import json
import urllib.error
from unittest.mock import MagicMock, patch

import pytest

from lingualdub.engines.sunbird.client import SunbirdAPIError, SunbirdClient


def test_sunbird_client_is_configured():
    client_none = SunbirdClient(api_key=None)
    assert client_none.is_configured is False

    client_empty = SunbirdClient(api_key="   ")
    assert client_empty.is_configured is False

    client_valid = SunbirdClient(api_key="sb-secret-key-123")
    assert client_valid.is_configured is True


def test_sunbird_client_unconfigured_raises():
    client = SunbirdClient(api_key=None)
    with pytest.raises(ValueError, match="Sunbird API key is missing"):
        client._get_headers()


def test_sunbird_transcribe_file_not_found():
    client = SunbirdClient(api_key="sb-token")
    with pytest.raises(FileNotFoundError):
        client.transcribe("/path/to/nonexistent/audio.wav")


def test_sunbird_transcribe_success(tmp_path):
    audio_path = tmp_path / "sample.wav"
    audio_path.write_bytes(b"RIFFdummydata")

    client = SunbirdClient(api_key="sb-token")
    mock_resp_data = {
        "text": "Tuli wamu nnyabo",
        "confidence": 0.94,
    }

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        res = client.transcribe(audio_path, language="lug")
        assert res["text"] == "Tuli wamu nnyabo"
        assert res["confidence"] == 0.94


def test_sunbird_transcribe_404_fallback(tmp_path):
    audio_path = tmp_path / "sample.wav"
    audio_path.write_bytes(b"RIFFdummydata")

    client = SunbirdClient(api_key="sb-token")

    def side_effect(req, *args, **kwargs):
        if "/tasks/audio/transcriptions" in req.full_url:
            fp = io.BytesIO(b"Endpoint not found")
            raise urllib.error.HTTPError(req.full_url, 404, "Not Found", {}, fp)
        # Legacy endpoint
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps({"text": "Legacy transcript"}).encode("utf-8")
        mock_resp.__enter__.return_value = mock_resp
        return mock_resp

    with patch("urllib.request.urlopen", side_effect=side_effect):
        res = client.transcribe(audio_path, language="lug")
        assert res["text"] == "Legacy transcript"


def test_sunbird_transcribe_http_error(tmp_path):
    audio_path = tmp_path / "sample.wav"
    audio_path.write_bytes(b"RIFFdummydata")

    client = SunbirdClient(api_key="sb-token")
    fp = io.BytesIO(b"Invalid token")

    with patch(
        "urllib.request.urlopen",
        side_effect=urllib.error.HTTPError("https://api.sunbird.ai", 401, "Unauthorized", {}, fp),
    ):
        with pytest.raises(SunbirdAPIError) as exc_info:
            client.transcribe(audio_path, language="lug")
        assert exc_info.value.status_code == 401


def test_sunbird_translate_success():
    client = SunbirdClient(api_key="sb-token")
    mock_resp_data = {"text": "Hello madam"}

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_resp_data).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        res = client.translate("Oli otya nnyabo", source_language="lug", target_language="eng")
        assert res["text"] == "Hello madam"


def test_sunbird_translate_404_fallback():
    client = SunbirdClient(api_key="sb-token")

    def side_effect(req, *args, **kwargs):
        if "/tasks/translate" in req.full_url:
            fp = io.BytesIO(b"Endpoint not found")
            raise urllib.error.HTTPError(req.full_url, 404, "Not Found", {}, fp)
        # Legacy endpoint /tasks/nmt
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps({"text": "Hello from legacy"}).encode("utf-8")
        mock_resp.__enter__.return_value = mock_resp
        return mock_resp

    with patch("urllib.request.urlopen", side_effect=side_effect):
        res = client.translate("Oli otya", source_language="lug", target_language="eng")
        assert res["text"] == "Hello from legacy"


def test_sunbird_translate_http_error():
    client = SunbirdClient(api_key="sb-token")
    fp = io.BytesIO(b"Rate limit exceeded")

    with patch(
        "urllib.request.urlopen",
        side_effect=urllib.error.HTTPError(
            "https://api.sunbird.ai", 429, "Too Many Requests", {}, fp
        ),
    ):
        with pytest.raises(SunbirdAPIError) as exc_info:
            client.translate("Test", "lug", "eng")
        assert exc_info.value.status_code == 429


def test_sunbird_synthesize_speech_success():
    client = SunbirdClient(api_key="sb-token")
    fake_wav_bytes = b"RIFF\x24\x00\x00\x00WAVEfmt "

    mock_resp = MagicMock()
    mock_resp.read.return_value = fake_wav_bytes
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        audio = client.synthesize_speech("Oli otya", language="lug")
        assert audio == fake_wav_bytes


def test_sunbird_synthesize_speech_error():
    client = SunbirdClient(api_key="sb-token")
    fp = io.BytesIO(b"Internal Error")

    with patch(
        "urllib.request.urlopen",
        side_effect=urllib.error.HTTPError("https://api.sunbird.ai", 500, "Server Error", {}, fp),
    ):
        with pytest.raises(SunbirdAPIError) as exc_info:
            client.synthesize_speech("Oli otya", language="lug")
        assert exc_info.value.status_code == 500
