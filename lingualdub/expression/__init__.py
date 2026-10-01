# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
African expressive speech and phonetic dictionary package.
"""

from __future__ import annotations

from lingualdub.expression.pronunciation import (
    DEFAULT_AFRICAN_PHONETIC_LEXICON,
    PronunciationDictionary,
)
from lingualdub.expression.ssml import (
    EMOTION_ACOUSTIC_PROFILES,
    ExpressiveSegment,
    SSMLParser,
)

__all__ = [
    "DEFAULT_AFRICAN_PHONETIC_LEXICON",
    "PronunciationDictionary",
    "EMOTION_ACOUSTIC_PROFILES",
    "ExpressiveSegment",
    "SSMLParser",
]
