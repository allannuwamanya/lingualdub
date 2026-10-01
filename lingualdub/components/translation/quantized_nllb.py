# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Quantized NLLB-200 translation component adapter using CTranslate2.
"""

from __future__ import annotations

from pathlib import Path

from lingualdub.components.translation.base import TranslationComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.resource import Resource
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment
from lingualdub.engines.quantized.nllb_ct2 import CTranslate2NLLBEngine
from lingualdub.languages.nllb import NLLB_CODE_MAP


class QuantizedNLLBTranslationComponent(TranslationComponent):
    """
    LingualDub Translation component wrapping CTranslate2 INT8 NLLB-200.
    """

    name: str = "quantized_nllb"
    version: str = "1.0.0"
    task: ComponentTask = ComponentTask.TRANSLATION
    supported_languages: list[str] = list(NLLB_CODE_MAP.keys())
    requires: list[str] = ["transcription"]
    provides: list[str] = ["translation"]
    on_failure: FailureMode = FailureMode.ABORT

    def __init__(
        self,
        model_path: str | Path | None = None,
        source_language: str = "lug",
        target_language: str = "eng",
        device: str = "cpu",
        compute_type: str = "int8",
        engine: CTranslate2NLLBEngine | None = None,
        version: str = "1.0.0",
    ) -> None:
        self.version = version
        super().__init__()
        self.source_language = source_language
        self.target_language = target_language
        self.engine = engine or CTranslate2NLLBEngine(
            model_path=model_path,
            device=device,
            compute_type=compute_type,
        )

    def run(self, input: Result | Resource) -> Result:
        if not isinstance(input, Result):
            raise ValueError(
                f"QuantizedNLLBTranslationComponent expects a Result input, got {type(input).__name__}"
            )

        if not input.segments:
            return Result(
                segments=[],
                source_language=input.source_language or self.source_language,
                target_language=self.target_language,
                warnings=list(input.warnings),
                provenance=dict(input.provenance),
                artifacts=list(input.artifacts),
                metadata=dict(input.metadata),
            )

        texts = [s.text for s in input.segments]
        decoded = self.engine.translate_batch(
            texts=texts,
            source_language=input.source_language or self.source_language,
            target_language=self.target_language,
        )

        translated_segments: list[Segment] = []
        for s, trans in zip(input.segments, decoded, strict=False):
            translated_segments.append(
                Segment(
                    start=s.start,
                    end=s.end,
                    text=trans.strip(),
                    language=self.target_language,
                    source_language=s.language or self.source_language,
                    speaker=s.speaker,
                    confidence=s.confidence,
                    metadata=dict(s.metadata),
                )
            )

        return Result(
            segments=translated_segments,
            source_language=input.source_language or self.source_language,
            target_language=self.target_language,
            warnings=list(input.warnings),
            provenance=dict(input.provenance),
            artifacts=list(input.artifacts),
            metadata={
                **input.metadata,
                "translation_engine": f"{self.name}@{self.version}",
                "compute_type": self.engine.compute_type,
            },
        )
