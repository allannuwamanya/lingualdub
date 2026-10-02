# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
OmniVoice GGUF TTS component adapter for zero-shot African voice cloning.
"""

from __future__ import annotations

import logging
import tempfile
from pathlib import Path

from lingualdub.components.tts.base import FittingStrategy, TTSComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.resource import Resource
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment
from lingualdub.engines.quantized.omnivoice_gguf import OmniVoiceGGUFEngine
from lingualdub.utils.consent import ensure_consent

logger = logging.getLogger(__name__)

OMNIVOICE_SUPPORTED_LANGUAGES = [
    "lug",
    "nyn",
    "swa",
    "eng",
    "ach",
    "teo",
    "lgg",
    "yor",
    "ibo",
    "hau",
    "zul",
    "xho",
    "kin",
    "som",
    "amh",
    "lin",
    "sna",
    "tsn",
    "sot",
    "nya",
    "wol",
    "aka",
    "ewe",
]


class OmniVoiceTTSComponent(TTSComponent):
    """
    Zero-shot voice cloning and TTS component running quantized GGUF models.
    """

    name: str = "omnivoice_gguf"
    version: str = "1.0.0"
    task: ComponentTask = ComponentTask.TTS
    supported_languages: list[str] = OMNIVOICE_SUPPORTED_LANGUAGES
    requires: list[str] = ["translation"]
    provides: list[str] = ["synthesised_audio"]
    on_failure: FailureMode = FailureMode.DEGRADE

    def __init__(
        self,
        ref_audio_path: str | Path | None = None,
        language: str = "lug",
        quant_override: str | None = None,
        output_dir: str | None = None,
        engine: OmniVoiceGGUFEngine | None = None,
        version: str = "1.0.0",
    ) -> None:
        self.version = version
        super().__init__()
        self.language = language
        self.ref_audio_path = str(ref_audio_path) if ref_audio_path else None
        self.output_dir = (
            Path(output_dir)
            if output_dir
            else Path(tempfile.gettempdir()) / "lingualdub_omnivoice_tts"
        )
        self.engine = engine or OmniVoiceGGUFEngine(quant_override=quant_override)

    def run(self, input: Result | Resource) -> Result:
        if not isinstance(input, Result):
            raise ValueError(
                f"OmniVoiceTTSComponent expects a Result input, got {type(input).__name__}"
            )
        ensure_consent(input, self.__class__.__name__)

        if not input.segments:
            return Result(
                segments=[],
                source_language=input.source_language,
                target_language=input.target_language or self.language,
                warnings=list(input.warnings),
                provenance=dict(input.provenance),
                artifacts=list(input.artifacts),
                metadata=dict(input.metadata),
            )

        from lingualdub.components.tts.shared import choose_strategy

        self.output_dir.mkdir(parents=True, exist_ok=True)
        artifacts: list[str] = list(input.artifacts)
        warnings: list[str] = list(input.warnings)
        out_segments: list[Segment] = []

        for idx, seg in enumerate(input.segments):
            text = (seg.text or "").strip()
            if not text:
                continue

            ratio = seg.metadata.get("duration_ratio", 1.0)
            target_dur = seg.metadata.get("target_duration", seg.duration)
            strategy = choose_strategy(ratio, text)

            new_meta = dict(seg.metadata)
            new_meta["fitting_strategy"] = strategy.value
            new_meta["target_duration"] = round(float(target_dur), 4)
            new_meta["source_segment_index"] = idx

            if strategy == FittingStrategy.SKIP:
                new_meta["unfit"] = True
                warnings.append(
                    f"OmniVoice segment #{idx} skipped (duration_ratio={ratio:.2f} exceeds threshold)"
                )
                out_segments.append(
                    Segment(
                        start=seg.start,
                        end=seg.end,
                        text=seg.text,
                        language=seg.language or self.language,
                        speaker=seg.speaker,
                        confidence=seg.confidence,
                        source_language=seg.source_language,
                        provenance=dict(seg.provenance),
                        metadata=new_meta,
                    )
                )
                continue

            # Reference audio priority: segment metadata > component default
            seg_ref_audio = seg.metadata.get("reference_audio", self.ref_audio_path)
            audio_file = self.output_dir / f"omnivoice_{self.language}_seg_{idx}_{self.version}.wav"

            try:
                speed = (
                    min(1.35, max(0.7, 1.0 / ratio))
                    if strategy == FittingStrategy.COMPRESS
                    else 1.0
                )
                self.engine.synthesize(
                    text=text,
                    output_wav=audio_file,
                    ref_audio_path=seg_ref_audio,
                    language=seg.language or self.language,
                    speed=speed,
                )
                artifacts.append(str(audio_file))

                out_segments.append(
                    Segment(
                        start=seg.start,
                        end=seg.end,
                        text=seg.text,
                        language=seg.language or self.language,
                        speaker=seg.speaker,
                        confidence=seg.confidence,
                        source_language=seg.source_language,
                        provenance=dict(seg.provenance),
                        metadata=new_meta,
                    )
                )
            except Exception as exc:
                logger.warning("OmniVoice synthesis failed on segment #%d (%r): %s", idx, text, exc)
                warnings.append(f"OmniVoice synthesis failed on segment #{idx}: {exc}")

        return Result(
            segments=out_segments,
            source_language=input.source_language,
            target_language=input.target_language or self.language,
            warnings=warnings,
            provenance=dict(input.provenance),
            artifacts=artifacts,
            metadata={
                **input.metadata,
                "tts_engine": f"{self.name}@{self.version}",
                "quant": self.engine.quant,
            },
        )

    def degrade(self, input: Result | Resource) -> Result:
        """Degraded fallback if OmniVoice GGUF synthesis fails."""
        from lingualdub.components.tts.dummy import DummyTTSComponent

        dummy = DummyTTSComponent(output_dir=str(self.output_dir))
        res = dummy.degrade(input)
        return res.mark_degraded(
            f"OmniVoiceTTSComponent ({self.language}) failed; fell back to dummy audio"
        )
