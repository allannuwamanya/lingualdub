# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Sherpa-ONNX MMS-TTS Component for ultra-lightweight offline African language speech synthesis.
"""

from __future__ import annotations

import logging
import tempfile
from pathlib import Path
from typing import Any

from lingualdub.components.tts.base import FittingStrategy, TTSComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.resource import Resource
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment
from lingualdub.engines.quantized.sherpa_mms import SherpaMMSEngine
from lingualdub.utils.consent import ensure_consent

logger = logging.getLogger(__name__)

SHERPA_MMS_LANGUAGES = [
    "lug", "nyn", "swa", "eng", "ach", "teo", "lgg",
    "yor", "ibo", "hau", "zul", "xho", "kin", "som", "amh", "lin",
]


class SherpaMMSTTSComponent(TTSComponent):
    """
    Lightweight offline TTS component wrapping Sherpa-ONNX quantized VITS models.
    """

    name: str = "sherpa_mms_tts"
    version: str = "1.0.0"
    task: ComponentTask = ComponentTask.TTS
    supported_languages: list[str] = SHERPA_MMS_LANGUAGES
    requires: list[str] = ["translation"]
    provides: list[str] = ["synthesised_audio"]
    on_failure: FailureMode = FailureMode.DEGRADE

    def __init__(
        self,
        model_path: str | Path | None = None,
        lexicon_path: str | Path | None = None,
        tokens_path: str | Path | None = None,
        data_dir: str | Path | None = None,
        language: str = "lug",
        output_dir: str | None = None,
        engine: SherpaMMSEngine | None = None,
        version: str = "1.0.0",
    ) -> None:
        self.version = version
        super().__init__()
        self.language = language
        self.output_dir = (
            Path(output_dir)
            if output_dir
            else Path(tempfile.gettempdir()) / "lingualdub_sherpa_mms"
        )
        self.engine = engine or SherpaMMSEngine(
            model_path=model_path,
            lexicon_path=lexicon_path,
            tokens_path=tokens_path,
            data_dir=data_dir,
            language=self.language,
        )

    def _write_wav(self, dest: Path, rate: int, samples: Any) -> None:
        """Write floating-point samples to 16-bit PCM WAV."""
        try:
            import scipy.io.wavfile

            scipy.io.wavfile.write(str(dest), rate=rate, data=samples)
        except ImportError:
            import array
            import wave

            with wave.open(str(dest), "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(rate)
                buf = array.array(
                    "h", [int(max(-1.0, min(1.0, float(x))) * 32767.0) for x in samples]
                )
                wf.writeframes(buf.tobytes())

    def run(self, input: Result | Resource) -> Result:
        if not isinstance(input, Result):
            raise ValueError(
                f"SherpaMMSTTSComponent expects a Result input, got {type(input).__name__}"
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
                    f"Sherpa MMS segment #{idx} skipped (duration_ratio={ratio:.2f} exceeds threshold)"
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
                # Adjust speed if compression strategy chosen
                speed = min(1.35, max(0.7, 1.0 / ratio)) if strategy == FittingStrategy.COMPRESS else 1.0
                sample_rate, samples = self.engine.synthesize(text, speed=speed)

                audio_file = self.output_dir / f"sherpa_mms_{self.language}_seg_{idx}_{self.version}.wav"
                self._write_wav(audio_file, sample_rate, samples)
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
                logger.warning("Sherpa MMS synthesis failed on segment #%d (%r): %s", idx, text, exc)
                warnings.append(f"Sherpa MMS synthesis failed on segment #{idx}: {exc}")

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
                "tts_runtime": "sherpa_onnx",
            },
        )

    def degrade(self, input: Result | Resource) -> Result:
        """Degraded fallback if ONNX synthesis fails."""
        from lingualdub.components.tts.dummy import DummyTTSComponent

        dummy = DummyTTSComponent(output_dir=str(self.output_dir))
        res = dummy.degrade(input)
        return res.mark_degraded(
            f"SherpaMMSTTSComponent ({self.language}) failed; fell back to dummy audio"
        )
