# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Audio Blending Component for Code-Switching Synthesis (Milestone 11).

Stitches together audio segments synthesized across different language-specific
TTS models, applying an acoustic cross-fade to maintain natural prosody and
prevent clicking or abrupt transitions at language boundaries.
"""

from __future__ import annotations

import logging
import math
import struct
import tempfile
import wave
from pathlib import Path
from typing import Any

from lingualdub.core.component import Component, ComponentTask, FailureMode
from lingualdub.core.resource import Resource
from lingualdub.core.result import Result

logger = logging.getLogger(__name__)


def _read_wav_samples(path: Path) -> tuple[list[float], int]:
    """Read a WAV file and return normalized float samples in [-1.0, 1.0] and sample rate."""
    with wave.open(str(path), "rb") as wf:
        n_channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        framerate = wf.getframerate()
        n_frames = wf.getnframes()
        raw_bytes = wf.readframes(n_frames)

    if sampwidth == 2:
        # 16-bit signed integer
        fmt = f"<{n_frames * n_channels}h"
        unpacked = struct.unpack(fmt, raw_bytes)
        # Average channels to mono and normalize to [-1.0, 1.0]
        if n_channels == 1:
            samples = [s / 32768.0 for s in unpacked]
        else:
            samples = [
                sum(unpacked[i * n_channels : (i + 1) * n_channels]) / (n_channels * 32768.0)
                for i in range(n_frames)
            ]
    elif sampwidth == 1:
        # 8-bit unsigned
        fmt = f"<{n_frames * n_channels}B"
        unpacked = struct.unpack(fmt, raw_bytes)
        if n_channels == 1:
            samples = [(s - 128) / 128.0 for s in unpacked]
        else:
            samples = [
                (sum(unpacked[i * n_channels : (i + 1) * n_channels]) / n_channels - 128) / 128.0
                for i in range(n_frames)
            ]
    else:
        # Fallback: simple byte representation
        samples = [0.0] * n_frames

    return samples, framerate


def _write_wav_samples(path: Path, samples: list[float], sample_rate: int = 16000) -> None:
    """Write normalized float samples to 16-bit mono WAV."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        # Clamp and pack to 16-bit integers
        int_samples = [int(max(-1.0, min(1.0, s)) * 32767.0) for s in samples]
        raw_data = struct.pack(f"<{len(int_samples)}h", *int_samples)
        wf.writeframes(raw_data)


def _crossfade_chunks(
    chunk_a: list[float],
    chunk_b: list[float],
    crossfade_samples: int,
    curve: str = "equal_power",
) -> list[float]:
    """Cross-fade chunk_a and chunk_b with equal-power or linear transition."""
    if not chunk_a:
        return chunk_b
    if not chunk_b:
        return chunk_a

    overlap = min(len(chunk_a), len(chunk_b), crossfade_samples)
    if overlap <= 0:
        return chunk_a + chunk_b

    head_a = chunk_a[:-overlap]
    fade_a = chunk_a[-overlap:]
    fade_b = chunk_b[:overlap]
    tail_b = chunk_b[overlap:]

    blended = []
    for i in range(overlap):
        t = (i + 1) / float(overlap)
        if curve == "equal_power":
            # Equal power cross-fade preserves perceived volume
            gain_a = math.cos(t * math.pi / 2.0)
            gain_b = math.sin(t * math.pi / 2.0)
        else:
            # Linear crossfade
            gain_a = 1.0 - t
            gain_b = t
        blended.append(fade_a[i] * gain_a + fade_b[i] * gain_b)

    return head_a + blended + tail_b


class AudioBlendingComponent(Component):
    """
    Stitches multi-segment synthesized audio into a seamless cross-faded stream.

    Designed for code-switched dubbing pipelines where different segments
    or words are rendered by different TTS engines.
    """

    name: str = "audio_blender"
    version: str = "1.0.0"
    task: ComponentTask = ComponentTask.CODE_SWITCH
    supported_languages: list[str] = ["*"]
    requires: list[str] = ["synthesised_audio"]
    provides: list[str] = ["blended_audio", "synthesised_audio"]
    on_failure: FailureMode = FailureMode.DEGRADE

    def __init__(
        self,
        crossfade_ms: float = 50.0,
        sample_rate: int = 16000,
        curve: str = "equal_power",
        output_dir: str | None = None,
        version: str = "1.0.0",
    ) -> None:
        super().__init__()
        self.crossfade_ms = crossfade_ms
        self.sample_rate = sample_rate
        self.curve = curve
        self.version = version
        self.output_dir = (
            Path(output_dir) if output_dir else Path(tempfile.gettempdir()) / "lingualdub_blender"
        )

    def run(self, input: Result | Resource) -> Result:
        if not isinstance(input, Result):
            raise ValueError(f"{self.name} expects a Result input, got {type(input).__name__}")

        # Gather audio files from artifacts in sequence
        audio_paths: list[Path] = []
        for art in input.artifacts:
            p = Path(str(art))
            if p.suffix.lower() in (".wav", ".mp3", ".flac") and p.exists():
                audio_paths.append(p)

        if not audio_paths:
            logger.debug("No audio artifacts found to blend; passing through.")
            return input

        if len(audio_paths) == 1:
            # Single audio artifact, already unified
            return input.replace(
                provenance={**input.provenance, "audio_blender": f"{self.name}@{self.version}"},
                metadata={**input.metadata, "audio_blended": True, "segment_count": 1},
            )

        self.output_dir.mkdir(parents=True, exist_ok=True)
        crossfade_samples = max(1, int((self.crossfade_ms / 1000.0) * self.sample_rate))

        merged_samples: list[float] = []
        for p in audio_paths:
            samples, sr = _read_wav_samples(p)
            if not samples:
                continue
            # Simple resample/padding if sample rate differs
            if sr != self.sample_rate and sr > 0:
                # Basic linear interpolation resampler
                ratio = self.sample_rate / sr
                new_len = int(len(samples) * ratio)
                resampled = []
                for i in range(new_len):
                    src_idx = i / ratio
                    i0 = int(src_idx)
                    i1 = min(i0 + 1, len(samples) - 1)
                    frac = src_idx - i0
                    resampled.append(samples[i0] * (1.0 - frac) + samples[i1] * frac)
                samples = resampled

            if not merged_samples:
                merged_samples = samples
            else:
                merged_samples = _crossfade_chunks(
                    merged_samples, samples, crossfade_samples, curve=self.curve
                )

        output_file = self.output_dir / f"blended_codeswitch_{self.version}_{len(audio_paths)}segs.wav"
        _write_wav_samples(output_file, merged_samples, self.sample_rate)

        new_artifacts = [str(output_file)] + list(input.artifacts)
        new_provenance = {
            **input.provenance,
            "audio_blender": f"{self.name}@{self.version}",
            "crossfade_ms": self.crossfade_ms,
            "blended_audio_path": str(output_file),
        }
        new_metadata = {
            **input.metadata,
            "audio_blended": True,
            "blended_audio_file": str(output_file),
            "blended_segment_count": len(audio_paths),
        }

        return input.replace(
            artifacts=new_artifacts,
            provenance=new_provenance,
            metadata=new_metadata,
        )

    def degrade(self, input: Result | Resource) -> Result:
        base = input if isinstance(input, Result) else Result()
        return base.mark_degraded("Audio blending unavailable; returning unblended artifacts.")
