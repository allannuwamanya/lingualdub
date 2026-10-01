# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Span-level content-addressed audio caching.

Provides 0ms re-synthesis by caching audio segments based on cryptographic hashes
of (text, voice_id, language, speed, emotion, engine_version).
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

DEFAULT_AUDIO_CACHE_DIR = Path.home() / ".cache" / "lingualdub" / "audio_cache"


def compute_cache_key(
    text: str,
    voice_id: str,
    language: str,
    speed: float = 1.0,
    emotion: str = "neutral",
    engine: str = "",
) -> str:
    """
    Compute a deterministic SHA-256 hash identifying a speech synthesis span.
    """
    raw = f"{text.strip()}|{voice_id}|{language}|{speed:.3f}|{emotion}|{engine}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class AudioContentCache:
    """
    Local file-backed content-addressed audio segment cache.
    """

    def __init__(self, cache_dir: str | Path | None = None) -> None:
        self.cache_dir = Path(cache_dir) if cache_dir else DEFAULT_AUDIO_CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Path | None:
        """Retrieve cached audio file path if present."""
        path = self.cache_dir / f"{key}.wav"
        if path.exists():
            self.hits += 1
            return path
        self.misses += 1
        return None

    def has(self, key: str) -> bool:
        """Check if audio span is present in cache."""
        return (self.cache_dir / f"{key}.wav").exists()

    def put(self, key: str, audio_bytes: bytes) -> Path:
        """Save synthesized audio bytes into cache."""
        path = self.cache_dir / f"{key}.wav"
        path.write_bytes(audio_bytes)
        return path

    def clear(self) -> int:
        """Clear all cached audio segments and return number of deleted files."""
        count = 0
        for f in self.cache_dir.glob("*.wav"):
            f.unlink(missing_ok=True)
            count += 1
        self.hits = 0
        self.misses = 0
        return count
