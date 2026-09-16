# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Audio Time-Stretch and Duration-Fitting Component (Milestone 12).

Applies pitch-preserving time-stretching to synthesized audio to fit the exact
target duration window required for video lip-sync and dialogue synchronization.
"""

from __future__ import annotations

import logging
import math
import struct
import tempfile
import wave
from pathlib import Path
from typing import Any

from lingualdub.components.alignment.base import AlignmentComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.resource import Resource
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment

logger = logging.getLogger(__name__)


def _get_wav_duration_and_samples(path: Path) -> tuple[float, list[float], int]:
    """Read a WAV file and return (duration_sec, normalized_samples, sample_rate)."""
    with wave.open(str(path), "rb") as wf:
        n_channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        framerate = wf.getframerate()
        n_frames = wf.getnframes()
        raw = wf.readframes(n_frames)

    duration = n_frames / float(framerate) if framerate > 0 else 0.0

    if sampwidth == 2:
        fmt = f"<{n_frames * n_channels}h"
        unpacked = struct.unpack(fmt, raw)
        if n_channels == 1:
            samples = [s / 32768.0 for s in unpacked]
        else:
            samples = [
                sum(unpacked[i * n_channels : (i + 1) * n_channels]) / (n_channels * 32768.0)
                for i in range(n_frames)
            ]
    else:
        samples = [0.0] * n_frames

    return duration, samples, framerate


def _write_wav_samples(path: Path, samples: list[float], sample_rate: int = 16000) -> None:
    """Write normalized float samples to 16-bit mono WAV."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        int_samples = [int(max(-1.0, min(1.0, s)) * 32767.0) for s in samples]
        raw_data = struct.pack(f"<{len(int_samples)}h", *int_samples)
        wf.writeframes(raw_data)


def _wsola_time_stretch(
    samples: list[float],
    rate: float,
    sample_rate: int = 16000,
) -> list[float]:
    """
    Time-stretch audio by speed factor `rate` using simplified WSOLA / Overlap-Add.

    rate > 1.0 -> speeds up (shorter duration)
    rate < 1.0 -> slows down (longer duration)
    """
    if rate <= 0.0 or not samples:
        return samples
    if abs(rate - 1.0) < 0.02:
        return samples

    # Target output length
    target_length = int(len(samples) / rate)
    if target_length <= 0:
        return samples

    # Overlap-add window parameters
    win_size = int(0.030 * sample_rate)  # 30ms window
    if win_size % 2 != 0:
        win_size += 1
    hop_out = win_size // 2
    hop_in = int(hop_out * rate)

    output: list[float] = [0.0] * (target_length + win_size)
    weights: list[float] = [0.0] * (target_length + win_size)

    # Hann window
    hann = [0.5 * (1 - math.cos(2 * math.pi * n / (win_size - 1))) for n in range(win_size)]

    in_pos = 0
    out_pos = 0
    while out_pos < target_length and in_pos + win_size <= len(samples):
        for i in range(win_size):
            output[out_pos + i] += samples[in_pos + i] * hann[i]
            weights[out_pos + i] += hann[i]

        out_pos += hop_out
        in_pos += hop_in

    # Normalize by window weights
    final_output = []
    for i in range(target_length):
        if i < len(output) and weights[i] > 1e-4:
            final_output.append(output[i] / weights[i])
        elif i < len(output):
            final_output.append(output[i])
        else:
            final_output.append(0.0)

    return final_output


class AudioTimeStretchComponent(AlignmentComponent):
    """
    Adjusts synthesized audio durations to match exact segment target durations.

    Fits audio to dialogue windows without modifying pitch, ensuring tight
    audio-visual synchronisation for dubbed video.
    """

    name: str = "audio_time_stretcher"
    version: str = "1.0.0"
    task: ComponentTask = ComponentTask.ALIGNMENT
    supported_languages: list[str] = ["*"]
    requires: list[str] = ["synthesised_audio", "duration_target"]
    provides: list[str] = ["duration_fitted_audio", "synthesised_audio"]
    on_failure: FailureMode = FailureMode.DEGRADE

    def __init__(
        self,
        max_speedup: float = 1.6,
        max_slowdown: float = 0.65,
        tolerance_sec: float = 0.05,
        output_dir: str | None = None,
        version: str = "1.0.0",
    ) -> None:
        super().__init__()
        self.max_speedup = max_speedup
        self.max_slowdown = max_slowdown
        self.tolerance_sec = tolerance_sec
        self.version = version
        self.output_dir = (
            Path(output_dir) if output_dir else Path(tempfile.gettempdir()) / "lingualdub_time_stretch"
        )

    def _stretch_audio_file(
        self,
        input_path: Path,
        output_path: Path,
        target_dur: float,
    ) -> tuple[bool, float]:
        """Stretch audio file to match target_dur. Returns (did_stretch, final_dur)."""
        duration, samples, sr = _get_wav_duration_and_samples(input_path)
        if duration <= 0 or not samples or target_dur <= 0:
            return False, duration

        dur_diff = abs(duration - target_dur)
        if dur_diff <= self.tolerance_sec:
            # Already within tolerance
            return False, duration

        rate = duration / target_dur
        # Clamp to bounds to prevent extreme chipmunk/slur distortion
        clamped_rate = max(self.max_slowdown, min(self.max_speedup, rate))

        # Try ffmpeg atempo filter if available, else WSOLA
        stretched = False
        try:
            import subprocess

            cmd = [
                "ffmpeg", "-y", "-i", str(input_path),
                "-filter:a", f"atempo={clamped_rate:.4f}",
                str(output_path),
            ]
            res = subprocess.run(cmd, capture_output=True, timeout=10)
            if res.returncode == 0 and output_path.exists():
                stretched = True
        except Exception:
            stretched = False

        if not stretched:
            stretched_samples = _wsola_time_stretch(samples, clamped_rate, sr)
            _write_wav_samples(output_path, stretched_samples, sr)

        final_dur, _, _ = _get_wav_duration_and_samples(output_path)
        return True, final_dur

    def run(self, input: Result | Resource) -> Result:
        if not isinstance(input, Result):
            raise ValueError(f"{self.name} expects a Result input, got {type(input).__name__}")

        if not input.artifacts or not input.segments:
            logger.debug("No audio artifacts or segments to time-stretch; passing through.")
            return input

        self.output_dir.mkdir(parents=True, exist_ok=True)
        new_artifacts: list[str] = []
        updated_segments: list[Segment] = []
        stretched_count = 0

        # Match artifacts to segments by index
        for idx, seg in enumerate(input.segments):
            target_dur = seg.metadata.get("target_duration", seg.duration)
            matching_art: Path | None = None
            if idx < len(input.artifacts):
                art_p = Path(str(input.artifacts[idx]))
                if art_p.suffix.lower() in (".wav", ".mp3", ".flac") and art_p.exists():
                    matching_art = art_p

            new_meta = dict(seg.metadata)

            if matching_art is not None and target_dur > 0:
                out_path = self.output_dir / f"stretched_seg_{idx}_{self.version}.wav"
                did_stretch, final_dur = self._stretch_audio_file(matching_art, out_path, target_dur)

                if did_stretch:
                    stretched_count += 1
                    new_meta["time_stretched"] = True
                    new_meta["actual_audio_duration"] = round(final_dur, 4)
                    new_meta["target_audio_duration"] = round(target_dur, 4)
                    new_meta["stretch_rate"] = round(seg.duration / target_dur, 4)
                    new_artifacts.append(str(out_path))
                else:
                    new_artifacts.append(str(matching_art))
            elif matching_art is not None:
                new_artifacts.append(str(matching_art))

            new_seg = seg.replace(
                metadata=new_meta,
                provenance={**seg.provenance, "time_stretcher": f"{self.name}@{self.version}"},
            )
            updated_segments.append(new_seg)

        # Append any remaining artifacts
        if len(input.artifacts) > len(input.segments):
            for art in input.artifacts[len(input.segments) :]:
                new_artifacts.append(str(art))

        return input.replace(
            segments=updated_segments,
            artifacts=new_artifacts if new_artifacts else list(input.artifacts),
            provenance={
                **input.provenance,
                "audio_time_stretcher": f"{self.name}@{self.version}",
                "segments_stretched": stretched_count,
            },
            metadata={
                **input.metadata,
                "duration_fitted": True,
                "stretched_segments_count": stretched_count,
            },
        )

    def degrade(self, input: Result | Resource) -> Result:
        base = input if isinstance(input, Result) else Result()
        return base.mark_degraded("Time-stretching unavailable; returning unmodified audio.")
