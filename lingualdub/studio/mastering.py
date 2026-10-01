# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Audio studio mastering and broadcast loudness normalization.

Implements LUFS loudness normalization, peak soft-saturation limiting,
and automatic background music ducking for professional voice production.
"""

from __future__ import annotations

import math
from collections.abc import Sequence


def calculate_rms(samples: Sequence[float]) -> float:
    """Calculate Root Mean Square (RMS) of audio samples."""
    if not samples:
        return 0.0
    sum_squares = sum(x * x for x in samples)
    return math.sqrt(sum_squares / len(samples))


def soft_clip_limiter(sample: float, threshold: float = 0.95) -> float:
    """Soft saturation limiter to prevent digital clipping while preserving dynamics."""
    if abs(sample) <= threshold:
        return sample
    # Hyperbolic tangent soft saturation curve above threshold
    sign = 1.0 if sample > 0 else -1.0
    overshoot = abs(sample) - threshold
    compressed = threshold + (1.0 - threshold) * math.tanh(overshoot / (1.0 - threshold))
    return sign * min(1.0, compressed)


def normalize_loudness(
    samples: Sequence[float],
    target_rms: float = 0.1,  # Corresponds roughly to -14 LUFS streaming standard
) -> list[float]:
    """
    Normalize audio track to a target perceptual loudness level with peak limiting.
    """
    current_rms = calculate_rms(samples)
    if current_rms <= 1e-6:
        return list(samples)

    gain = target_rms / current_rms

    # Apply gain with soft saturation limiting
    return [soft_clip_limiter(x * gain) for x in samples]


def duck_background_audio(
    vocals: Sequence[float],
    music: Sequence[float],
    vocal_threshold: float = 0.02,
    duck_gain: float = 0.25,  # -12dB attenuation during speech
    smoothing_samples: int = 400,
) -> list[float]:
    """
    Automatically duck (lower volume of) background music when voice is active.
    """
    length = min(len(vocals), len(music))
    result: list[float] = []

    current_gain = 1.0

    for i in range(length):
        is_speaking = abs(vocals[i]) > vocal_threshold
        target_gain = duck_gain if is_speaking else 1.0

        # Smooth envelope transition
        current_gain += (target_gain - current_gain) / smoothing_samples
        result.append(music[i] * current_gain)

    # Append any remaining music samples
    if len(music) > length:
        result.extend(music[length:])

    return result
