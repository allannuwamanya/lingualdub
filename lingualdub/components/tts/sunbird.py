# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Sunbird AI TTS component adapter for Ugandan and East African languages.

Synthesizes high-fidelity speech using Sunbird AI cloud endpoints, enforcing
consent verification, duration-constrained fitting strategies, and degraded audio fallback.
"""

from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path

from lingualdub.components.tts.base import FittingStrategy, TTSComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.resource import Resource
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment
from lingualdub.engines.sunbird.client import SunbirdClient
from lingualdub.utils.consent import ensure_consent

logger = logging.getLogger(__name__)

SUNBIRD_TTS_LANGUAGES = ["lug", "nyn", "ach", "teo", "lgg", "eng"]


class SunbirdTTSComponent(TTSComponent):
    """
    TTS component delegating speech synthesis to Sunbird AI cloud platform.
    """

    name: str = "sunbird_tts"
    version: str = "1.0.0"
    task: ComponentTask = ComponentTask.TTS
    supported_languages: list[str] = SUNBIRD_TTS_LANGUAGES
    requires: list[str] = ["translation"]
    provides: list[str] = ["synthesised_audio"]
    on_failure: FailureMode = FailureMode.DEGRADE

    def __init__(
        self,
        api_key: str | None = None,
        language: str = "lug",
        voice_id: str | None = None,
        output_dir: str | None = None,
        client: SunbirdClient | None = None,
        version: str = "1.0.0",
    ) -> None:
        self.version = version
        super().__init__()
        self.api_key = api_key or os.environ.get("SUNBIRD_API_KEY")
        self.language = language
        self.voice_id = voice_id
        self.output_dir = (
            Path(output_dir)
            if output_dir
            else Path(tempfile.gettempdir()) / "lingualdub_sunbird_tts"
        )
        self.client = client or SunbirdClient(api_key=self.api_key)

    def run(self, input: Result | Resource) -> Result:
        if not isinstance(input, Result):
            raise ValueError(  # justified: component input validation
                f"SunbirdTTSComponent expects a Result input, got {type(input).__name__}"
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

        if not self.client.is_configured:
            raise ValueError(  # justified: component configuration requirement
                "Sunbird TTS synthesis requires an API key. Set SUNBIRD_API_KEY or supply client."
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
                    f"Sunbird TTS segment #{idx} skipped (duration_ratio={ratio:.2f} exceeds threshold)"
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

            try:
                audio_bytes = self.client.synthesize_speech(
                    text=text,
                    language=seg.language or self.language,
                    voice_id=self.voice_id,
                )
                audio_file = (
                    self.output_dir / f"sunbird_{self.language}_seg_{idx}_{self.version}.wav"
                )
                with open(audio_file, "wb") as f:
                    f.write(audio_bytes)

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
                logger.warning(
                    "Sunbird TTS synthesis failed on segment #%d (%r): %s", idx, text, exc
                )
                warnings.append(f"Sunbird TTS synthesis failed on segment #{idx}: {exc}")

        return Result(
            segments=out_segments,
            source_language=input.source_language,
            target_language=input.target_language or self.language,
            warnings=warnings,
            provenance=dict(input.provenance),
            artifacts=artifacts,
            metadata={
                **input.metadata,
                "tts_provider": "sunbird_api",
                "tts_engine": f"{self.name}@{self.version}",
            },
        )

    def degrade(self, input: Result | Resource) -> Result:
        """Degraded fallback if Sunbird cloud synthesis fails or is unreachable."""
        from lingualdub.components.tts.dummy import DummyTTSComponent

        dummy = DummyTTSComponent(output_dir=str(self.output_dir))
        res = dummy.degrade(input)
        return res.mark_degraded(
            f"SunbirdTTSComponent ({self.language}) failed; fell back to dummy audio"
        )
