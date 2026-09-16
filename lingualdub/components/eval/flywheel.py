# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Data Flywheel Evaluator Component (Milestone 13).

Detects low-confidence, degraded, or anomalous segments during pipeline execution
and automatically extracts audio snippets and structured JSONL correction samples
to feed active learning and community-driven model refinement.
"""

from __future__ import annotations

import hashlib
import json
import logging
import tempfile
import wave
from pathlib import Path
from typing import Any

from lingualdub.components.eval.base import EvaluatorComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.resource import Resource
from lingualdub.core.result import Result

logger = logging.getLogger(__name__)


def _snip_wav(source_wav: Path, dest_wav: Path, start_sec: float, end_sec: float) -> bool:
    """Snip a time slice from source_wav and save to dest_wav using standard wave library."""
    if not source_wav.exists():
        return False
    try:
        dest_wav.parent.mkdir(parents=True, exist_ok=True)
        with wave.open(str(source_wav), "rb") as src:
            framerate = src.getframerate()
            n_channels = src.getnchannels()
            sampwidth = src.getsampwidth()
            n_frames = src.getnframes()

            start_frame = max(0, int(start_sec * framerate))
            end_frame = min(n_frames, int(end_sec * framerate))
            if end_frame <= start_frame:
                return False

            src.setpos(start_frame)
            frames_to_read = end_frame - start_frame
            raw_data = src.readframes(frames_to_read)

        with wave.open(str(dest_wav), "wb") as dst:
            dst.setnchannels(n_channels)
            dst.setsampwidth(sampwidth)
            dst.setframerate(framerate)
            dst.writeframes(raw_data)
        return True
    except Exception as exc:
        logger.debug("Failed to snip audio slice (%s)", exc)
        return False


class DataFlywheelComponent(EvaluatorComponent):
    """
    Evaluator that identifies low-confidence dubbing segments and exports
    them as structured training / correction candidates for community models.
    """

    name: str = "data_flywheel"
    version: str = "1.0.0"
    task: ComponentTask = ComponentTask.EVAL
    supported_languages: list[str] = ["*"]
    requires: list[str] = []
    provides: list[str] = ["data_flywheel_metrics"]
    on_failure: FailureMode = FailureMode.SKIP

    def __init__(
        self,
        confidence_threshold: float = 0.65,
        dataset_name: str = "lingualdub_corrections",
        snip_audio: bool = True,
        output_dir: str | None = None,
        version: str = "1.0.0",
    ) -> None:
        super().__init__()
        self.confidence_threshold = confidence_threshold
        self.dataset_name = dataset_name
        self.snip_audio = snip_audio
        self.version = version
        self.output_dir = (
            Path(output_dir) if output_dir else Path(tempfile.gettempdir()) / "lingualdub_flywheel"
        )

    def _resolve_source_audio(self, input_obj: Result) -> Path | None:
        """Find source audio file from provenance or artifacts."""
        for key in ("audio_path", "source_audio", "path"):
            val = input_obj.provenance.get(key)
            if isinstance(val, str) and Path(val).exists():
                return Path(val)

        for art in input_obj.artifacts:
            p = Path(str(art))
            if p.suffix.lower() in (".wav", ".mp3", ".flac") and p.exists():
                return p
        return None

    def run(self, input: Result | Resource) -> Result:
        if not isinstance(input, Result):
            return Result()

        self.output_dir.mkdir(parents=True, exist_ok=True)
        snippets_dir = self.output_dir / "snippets"
        jsonl_path = self.output_dir / f"{self.dataset_name}.jsonl"

        source_audio = self._resolve_source_audio(input)
        flagged_samples: list[dict[str, Any]] = []

        for idx, seg in enumerate(input.segments):
            conf = seg.confidence
            is_low_conf = conf is not None and conf < self.confidence_threshold
            is_unfit = seg.metadata.get("unfit") is True
            is_zero_dur = seg.metadata.get("zero_duration_source") is True

            if is_low_conf or is_unfit or is_zero_dur:
                # Generate sample id
                text_hash = hashlib.sha256((seg.text or f"seg_{idx}").encode()).hexdigest()[:8]
                sample_id = f"sample_{idx}_{text_hash}"
                snippet_path_str = None

                if self.snip_audio and source_audio:
                    dest_snip = snippets_dir / f"{sample_id}.wav"
                    if _snip_wav(source_audio, dest_snip, seg.start, seg.end):
                        snippet_path_str = str(dest_snip)

                sample_record = {
                    "id": sample_id,
                    "segment_index": idx,
                    "start": seg.start,
                    "end": seg.end,
                    "duration": round(seg.duration, 4),
                    "text": seg.text,
                    "language": seg.language or input.source_language,
                    "source_language": seg.source_language or input.source_language,
                    "target_language": input.target_language,
                    "confidence": conf,
                    "audio_snippet": snippet_path_str,
                    "flag_reason": "low_confidence"
                    if is_low_conf
                    else ("unfit" if is_unfit else "zero_duration"),
                    "metadata": seg.metadata,
                    "provenance": seg.provenance,
                }
                flagged_samples.append(sample_record)

        # Append flagged samples to JSONL dataset
        if flagged_samples:
            with open(jsonl_path, "a", encoding="utf-8") as f:
                for sample in flagged_samples:
                    f.write(json.dumps(sample, ensure_ascii=False) + "\n")

        flywheel_metrics = {
            "total_segments": len(input.segments),
            "flagged_samples_count": len(flagged_samples),
            "flagged_rate": round(len(flagged_samples) / max(1, len(input.segments)), 4),
            "confidence_threshold": self.confidence_threshold,
            "exported_dataset_path": str(jsonl_path) if flagged_samples else None,
        }

        new_meta = {
            **input.metadata,
            "data_flywheel": flywheel_metrics,
            "metrics": {
                **input.metadata.get("metrics", {}),
                "data_flywheel": flywheel_metrics,
            },
        }

        new_prov = {
            **input.provenance,
            "data_flywheel": f"{self.name}@{self.version}",
            "data_flywheel_dataset": str(jsonl_path),
        }

        return input.replace(metadata=new_meta, provenance=new_prov)
