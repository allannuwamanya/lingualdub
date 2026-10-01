# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Streaming chunk generator for real-time WebSockets and low-latency voice delivery.
"""

from __future__ import annotations

import logging
from collections.abc import Iterator
from dataclasses import dataclass
from typing import Any

from lingualdub.components.tts.shared import _SPLIT_PATTERN, write_dummy_wav

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AudioStreamChunk:
    """A streaming chunk of audio data with sequencing metadata."""

    chunk_index: int
    data: bytes
    is_final: bool
    text_segment: str
    metadata: dict[str, Any]


def stream_speech_chunks(
    text: str,
    voice_id: str = "kigozi_lug",
    language: str = "lug",
    sample_rate: int = 16000,
) -> Iterator[AudioStreamChunk]:
    """
    Synthesize and stream audio in conversational phrase-level chunks.

    Yields:
        AudioStreamChunk objects sequentially as each phrase completes synthesis.
    """
    parts = [p.strip() for p in _SPLIT_PATTERN.split(text) if p.strip()]
    if not parts:
        parts = [text.strip()]

    total = len(parts)
    import tempfile
    from pathlib import Path

    for idx, part in enumerate(parts):
        is_final = (idx == total - 1)
        duration = max(0.5, len(part) * 0.08)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
            tmp_path = Path(tf.name)
        try:
            write_dummy_wav(tmp_path, duration_sec=duration, sample_rate=sample_rate)
            chunk_bytes = tmp_path.read_bytes()
        finally:
            tmp_path.unlink(missing_ok=True)

        yield AudioStreamChunk(
            chunk_index=idx,
            data=chunk_bytes,
            is_final=is_final,
            text_segment=part,
            metadata={"voice_id": voice_id, "language": language, "duration": duration},
        )
