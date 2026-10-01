# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Faster-Whisper (CTranslate2) quantized ASR engine.

Provides fast, INT8-quantized offline speech-to-text running in ~150MB RAM on CPU.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from lingualdub.engines.base import BaseEngine, EngineInfo, EngineStatus, EngineType

logger = logging.getLogger(__name__)


class FasterWhisperEngine(BaseEngine):
    """
    Faster-Whisper execution engine using CTranslate2 for quantized ASR.
    """

    name = "faster_whisper"
    version = "1.0.0"
    engine_type = EngineType.QUANTIZED_LOCAL

    def __init__(
        self,
        model_size_or_path: str = "tiny",
        device: str = "cpu",
        compute_type: str = "int8",
        cpu_threads: int = 4,
    ) -> None:
        super().__init__()
        self.model_size_or_path = model_size_or_path
        self.device = device
        self.compute_type = compute_type
        self.cpu_threads = cpu_threads
        self._model: Any = None

    def is_available(self) -> bool:
        """Check if faster_whisper runtime is installed."""
        try:
            import faster_whisper  # noqa: F401
            return True
        except ImportError:
            return False

    def initialize(self) -> None:
        """Load WhisperModel into memory."""
        if self._model is None:
            try:
                from faster_whisper import WhisperModel
            except ImportError as exc:
                self._status = EngineStatus.ERROR
                self._error_message = str(exc)
                raise RuntimeError(
                    "FasterWhisperEngine requires 'faster-whisper'. "
                    "Install with: pip install faster-whisper"
                ) from exc

            logger.info(
                "Loading faster-whisper model %r (%s on %s)",
                self.model_size_or_path,
                self.compute_type,
                self.device,
            )
            self._model = WhisperModel(
                self.model_size_or_path,
                device=self.device,
                compute_type=self.compute_type,
                cpu_threads=self.cpu_threads,
            )
            self._status = EngineStatus.READY

    def shutdown(self) -> None:
        self._model = None
        self._status = EngineStatus.STOPPED

    def transcribe(
        self,
        audio_path: str | Path,
        language: str | None = None,
        beam_size: int = 5,
        word_timestamps: bool = True,
    ) -> tuple[list[dict[str, Any]], dict[str, Any]]:
        """
        Transcribe audio file into structured segments with timestamps.

        Returns:
            Tuple of (segments_list, transcription_info_dict).
        """
        if self._model is None:
            self.initialize()

        segments_iter, info = self._model.transcribe(
            str(audio_path),
            language=language,
            beam_size=beam_size,
            word_timestamps=word_timestamps,
        )

        segments: list[dict[str, Any]] = []
        for s in segments_iter:
            words = []
            if hasattr(s, "words") and s.words:
                words = [
                    {"word": w.word, "start": w.start, "end": w.end, "probability": w.probability}
                    for w in s.words
                ]
            segments.append({
                "start": float(s.start),
                "end": float(s.end),
                "text": s.text.strip(),
                "confidence": getattr(s, "avg_logprob", 0.9),
                "words": words,
            })

        info_dict = {
            "language": getattr(info, "language", language or "und"),
            "language_probability": getattr(info, "language_probability", 1.0),
            "duration": getattr(info, "duration", 0.0),
        }
        return segments, info_dict

    def get_info(self) -> EngineInfo:
        return EngineInfo(
            name=self.name,
            version=self.version,
            engine_type=self.engine_type,
            supported_tasks=["asr", "language_detection", "word_timestamps"],
            supported_languages=["lug", "nyn", "swa", "eng", "hau", "yor", "ibo", "lin", "afr"],
            memory_footprint_mb=150,
            requires_gpu=False,
            requires_network=False,
            metadata={
                "compute_type": self.compute_type,
                "device": self.device,
                "model_size_or_path": self.model_size_or_path,
            },
        )
