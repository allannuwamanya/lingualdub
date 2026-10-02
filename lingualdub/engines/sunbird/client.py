# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Sunbird AI modern API client for African language speech and translation services.

Target endpoints on api.sunbird.ai:
- Speech Recognition (ASR): POST /tasks/audio/transcriptions (legacy: /tasks/stt)
- Translation (MT): POST /tasks/translate
- Text-to-Speech (TTS): POST /tasks/audio/speech
"""

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, cast

from lingualdub.exceptions import StageExecutionError

logger = logging.getLogger(__name__)

DEFAULT_SUNBIRD_BASE_URL = "https://api.sunbird.ai"
DEFAULT_TIMEOUT_SECONDS = 60


class SunbirdAPIError(StageExecutionError):
    """Raised when Sunbird AI API returns an error response."""

    def __init__(
        self, message: str, status_code: int | None = None, response_body: str | None = None
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


class SunbirdClient:
    """
    Client for interacting with Sunbird AI's speech and translation API.

    Authentication is performed via bearer token passed as SUNBIRD_API_KEY.
    """

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str = DEFAULT_SUNBIRD_BASE_URL,
        timeout: int = DEFAULT_TIMEOUT_SECONDS,
    ) -> None:
        self.api_key = api_key or os.environ.get("SUNBIRD_API_KEY")
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    @property
    def is_configured(self) -> bool:
        """Return True if an API token is present."""
        return bool(self.api_key and self.api_key.strip())

    def _get_headers(self, content_type: str = "application/json") -> dict[str, str]:
        if not self.is_configured or not self.api_key:
            raise ValueError(  # justified: missing authentication credentials for third-party API
                "Sunbird API key is missing. Set SUNBIRD_API_KEY environment variable or pass api_key."
            )
        return {
            "Authorization": f"Bearer {self.api_key.strip()}",
            "Accept": "application/json",
            "Content-Type": content_type,
            "User-Agent": "LingualDub-SpeechAI/0.1.0",
        }

    def transcribe(
        self,
        audio_path_or_bytes: str | Path | bytes,
        language: str = "lug",
    ) -> dict[str, Any]:
        """
        Transcribe audio using Sunbird ASR.

        Args:
            audio_path_or_bytes: File path to audio or raw audio bytes.
            language: Language code (e.g. "lug", "nyn", "ach", "teo", "lgg").

        Returns:
            Dictionary containing transcription text, confidence, and timestamps.
        """
        url = f"{self.base_url}/tasks/audio/transcriptions"

        if isinstance(audio_path_or_bytes, (str, Path)):
            path = Path(audio_path_or_bytes)
            if not path.exists():
                raise FileNotFoundError(f"Audio file not found: {path}")
            with open(path, "rb") as f:
                audio_data = f.read()
        else:
            audio_data = audio_path_or_bytes

        # Sunbird accepts multipart/form-data or binary audio stream.
        # Format payload with language query parameter
        query_params = urllib.parse.urlencode({"language": language})
        full_url = f"{url}?{query_params}"

        headers = self._get_headers(content_type="audio/wav")
        headers["Content-Length"] = str(len(audio_data))

        req = urllib.request.Request(full_url, data=audio_data, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return cast(dict[str, Any], data)
        except urllib.error.HTTPError as exc:
            # Fallback to legacy endpoint /tasks/stt if 404
            if exc.code == 404:
                return self._transcribe_legacy(audio_data, language)
            err_body = exc.read().decode("utf-8", errors="replace")
            raise SunbirdAPIError(
                f"Sunbird ASR API returned HTTP {exc.code}: {err_body}",
                status_code=exc.code,
                response_body=err_body,
            ) from exc
        except Exception as exc:
            raise SunbirdAPIError(f"Failed to communicate with Sunbird ASR: {exc}") from exc

    def _transcribe_legacy(self, audio_data: bytes, language: str) -> dict[str, Any]:
        """Fallback to legacy Sunbird STT endpoint."""
        legacy_url = f"{self.base_url}/tasks/stt?{urllib.parse.urlencode({'language': language})}"
        headers = self._get_headers(content_type="audio/wav")
        headers["Content-Length"] = str(len(audio_data))

        req = urllib.request.Request(legacy_url, data=audio_data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return cast(dict[str, Any], json.loads(resp.read().decode("utf-8")))
        except Exception as exc:
            raise SunbirdAPIError(f"Sunbird legacy STT failed: {exc}") from exc

    def translate(
        self,
        text: str,
        source_language: str,
        target_language: str,
    ) -> dict[str, Any]:
        """
        Translate text using Sunbird Sunflower MT.

        Args:
            text: Text to translate.
            source_language: Source language code (e.g. "lug", "eng").
            target_language: Target language code (e.g. "eng", "lug").

        Returns:
            Dictionary containing translated text.
        """
        url = f"{self.base_url}/tasks/translate"
        payload = {
            "source_language": source_language,
            "target_language": target_language,
            "text": text,
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        headers = self._get_headers(content_type="application/json")

        req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return cast(dict[str, Any], json.loads(resp.read().decode("utf-8")))
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                return self._translate_legacy(text, source_language, target_language)
            err_body = exc.read().decode("utf-8", errors="replace")
            raise SunbirdAPIError(
                f"Sunbird Translation API returned HTTP {exc.code}: {err_body}",
                status_code=exc.code,
                response_body=err_body,
            ) from exc
        except Exception as exc:
            raise SunbirdAPIError(f"Failed to communicate with Sunbird Translation: {exc}") from exc

    def _translate_legacy(
        self, text: str, source_language: str, target_language: str
    ) -> dict[str, Any]:
        """Fallback to legacy Sunbird /tasks/nmt endpoint."""
        legacy_names = {
            "lug": "Luganda",
            "nyn": "Runyankole",
            "ach": "Acholi",
            "teo": "Ateso",
            "lgg": "Lugbara",
            "eng": "English",
        }
        src_name = legacy_names.get(source_language, source_language)
        tgt_name = legacy_names.get(target_language, target_language)

        legacy_url = f"{self.base_url}/tasks/nmt"
        payload = {
            "source_language": src_name,
            "target_language": tgt_name,
            "text": text,
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        headers = self._get_headers(content_type="application/json")

        req = urllib.request.Request(legacy_url, data=data_bytes, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return cast(dict[str, Any], json.loads(resp.read().decode("utf-8")))
        except Exception as exc:
            raise SunbirdAPIError(f"Sunbird legacy NMT failed: {exc}") from exc

    def synthesize_speech(
        self,
        text: str,
        language: str = "lug",
        voice_id: str | None = None,
    ) -> bytes:
        """
        Synthesize speech audio from text using Sunbird TTS.

        Args:
            text: Text to synthesize.
            language: Language code (e.g. "lug", "ach", "nyn").
            voice_id: Optional voice profile identifier.

        Returns:
            Raw audio bytes (WAV or MP3).
        """
        url = f"{self.base_url}/tasks/audio/speech"
        payload = {
            "text": text,
            "language": language,
        }
        if voice_id:
            payload["voice_id"] = voice_id

        data_bytes = json.dumps(payload).encode("utf-8")
        headers = self._get_headers(content_type="application/json")
        headers["Accept"] = "audio/wav, audio/mpeg, application/octet-stream"

        req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                audio_bytes = resp.read()
                return cast(bytes, audio_bytes)
        except urllib.error.HTTPError as exc:
            err_body = exc.read().decode("utf-8", errors="replace")
            raise SunbirdAPIError(
                f"Sunbird TTS API returned HTTP {exc.code}: {err_body}",
                status_code=exc.code,
                response_body=err_body,
            ) from exc
        except Exception as exc:
            raise SunbirdAPIError(f"Failed to communicate with Sunbird TTS: {exc}") from exc
