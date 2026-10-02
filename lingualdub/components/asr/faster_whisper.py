# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Faster-Whisper INT8 quantized ASR component adapter.
"""

from __future__ import annotations

import logging
from pathlib import Path

from lingualdub.components.asr.base import ASRComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.resource import Resource
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment
from lingualdub.engines.quantized.whisper_ct2 import FasterWhisperEngine
from lingualdub.utils.consent import ensure_consent
from lingualdub.utils.provenance import propagated_provenance

logger = logging.getLogger(__name__)

FASTER_WHISPER_LANGUAGES = [
    "lug",
    "nyn",
    "swa",
    "eng",
    "hau",
    "yor",
    "ibo",
    "lin",
    "afr",
    "fra",
]


class FasterWhisperASRComponent(ASRComponent):
    """
    Lightweight, fast offline ASR component using CTranslate2 INT8 Whisper models.
    """

    name: str = "faster_whisper_asr"
    version: str = "1.0.0"
    task: ComponentTask = ComponentTask.ASR
    supported_languages: list[str] = FASTER_WHISPER_LANGUAGES
    requires: list[str] = []
    provides: list[str] = ["transcription", "word_timestamps", "language_detection"]
    on_failure: FailureMode = FailureMode.ABORT

    def __init__(
        self,
        model_size_or_path: str = "tiny",
        language: str | None = None,
        device: str = "cpu",
        compute_type: str = "int8",
        cpu_threads: int = 4,
        engine: FasterWhisperEngine | None = None,
        version: str = "1.0.0",
    ) -> None:
        self.version = version
        super().__init__()
        self.language = language
        self.engine = engine or FasterWhisperEngine(
            model_size_or_path=model_size_or_path,
            device=device,
            compute_type=compute_type,
            cpu_threads=cpu_threads,
        )

    def run(self, input: Result | Resource) -> Result:
        audio_path: str | None = None
        source_lang: str | None = self.language

        if isinstance(input, Resource):
            source_lang = input.language or self.language
            audio_path = str(input.path) if input.path else None
            if not audio_path and input.provenance.get("path"):
                audio_path = str(input.provenance["path"])
        elif isinstance(input, Result):
            source_lang = input.source_language or self.language
            if input.artifacts:
                audio_path = input.artifacts[0]

        if not audio_path or not Path(audio_path).exists():
            raise FileNotFoundError(
                f"FasterWhisper ASR audio path {audio_path!r} does not exist or was not specified."
            )

        ensure_consent(input, self.__class__.__name__)

        raw_segments, info = self.engine.transcribe(
            audio_path=audio_path,
            language=source_lang,
        )

        detected_lang = info.get("language") or source_lang or "und"
        segments: list[Segment] = []

        for s in raw_segments:
            meta = {}
            if s.get("words"):
                meta["words"] = s["words"]
            segments.append(
                Segment(
                    start=s["start"],
                    end=s["end"],
                    text=s["text"],
                    language=detected_lang,
                    confidence=s.get("confidence", 0.9),
                    metadata=meta,
                )
            )

        return Result(
            segments=segments,
            source_language=detected_lang,
            provenance=propagated_provenance(input),
            metadata={
                "asr_engine": f"{self.name}@{self.version}",
                "model": self.engine.model_size_or_path,
                "compute_type": self.engine.compute_type,
                "detected_language": detected_lang,
                "language_probability": info.get("language_probability", 1.0),
            },
        )
