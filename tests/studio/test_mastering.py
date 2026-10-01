# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

import math

from lingualdub.studio.mastering import (
    calculate_rms,
    duck_background_audio,
    normalize_loudness,
    soft_clip_limiter,
)


def test_calculate_rms_empty():
    assert calculate_rms([]) == 0.0


def test_calculate_rms_dc():
    samples = [1.0, -1.0, 1.0, -1.0]
    assert math.isclose(calculate_rms(samples), 1.0, rel_tol=1e-5)


def test_calculate_rms_values():
    samples = [0.5, -0.5, 0.5, -0.5]
    assert math.isclose(calculate_rms(samples), 0.5, rel_tol=1e-5)


def test_soft_clip_limiter_below_threshold():
    sample = 0.5
    assert soft_clip_limiter(sample, threshold=0.95) == 0.5


def test_soft_clip_limiter_above_threshold():
    sample = 1.5
    limited = soft_clip_limiter(sample, threshold=0.95)
    assert 0.95 <= limited <= 1.0


def test_soft_clip_limiter_negative():
    sample = -2.0
    limited = soft_clip_limiter(sample, threshold=0.95)
    assert -1.0 <= limited <= -0.95


def test_normalize_loudness_silent():
    samples = [0.0, 0.0, 0.0]
    normalized = normalize_loudness(samples, target_rms=0.1)
    assert normalized == samples


def test_normalize_loudness_boost():
    # Audio with RMS ~ 0.01 boosted to target_rms = 0.1
    samples = [0.01, -0.01, 0.01, -0.01]
    normalized = normalize_loudness(samples, target_rms=0.1)
    new_rms = calculate_rms(normalized)
    assert math.isclose(new_rms, 0.1, rel_tol=1e-2)


def test_normalize_loudness_limiting():
    # Audio with very high peaks
    samples = [10.0, -10.0, 10.0, -10.0]
    normalized = normalize_loudness(samples, target_rms=0.5)
    for x in normalized:
        assert -1.0 <= x <= 1.0


def test_duck_background_audio():
    # Vocal is speaking (amplitude > 0.02)
    vocals = [0.1] * 100
    music = [1.0] * 100

    ducked = duck_background_audio(
        vocals=vocals,
        music=music,
        vocal_threshold=0.02,
        duck_gain=0.2,
        smoothing_samples=10,
    )
    assert len(ducked) == 100
    # Over time, music volume should drop towards 0.2
    assert ducked[-1] < ducked[0]
    assert ducked[-1] < 0.3


def test_duck_background_audio_different_lengths():
    vocals = [0.0] * 20
    music = [0.8] * 40
    ducked = duck_background_audio(vocals=vocals, music=music)
    assert len(ducked) == 40
    # Last 20 samples from music are preserved directly
    assert ducked[25] == 0.8
