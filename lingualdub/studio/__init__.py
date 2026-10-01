# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Audio studio and post-production processing package.
"""

from __future__ import annotations

from lingualdub.studio.mastering import (
    calculate_rms,
    duck_background_audio,
    normalize_loudness,
    soft_clip_limiter,
)

__all__ = [
    "calculate_rms",
    "soft_clip_limiter",
    "normalize_loudness",
    "duck_background_audio",
]
