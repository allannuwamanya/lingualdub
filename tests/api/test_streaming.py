# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for real-time speech streaming.
"""

from lingualdub.api.streaming import AudioStreamChunk, stream_speech_chunks


def test_stream_speech_chunks():
    text = "Oli otya nnyabo. Tusanyuse nnyo okukulaba leero."
    chunks = list(stream_speech_chunks(text, voice_id="kigozi_lug", language="lug"))

    assert len(chunks) == 2
    for idx, c in enumerate(chunks):
        assert isinstance(c, AudioStreamChunk)
        assert c.chunk_index == idx
        assert len(c.data) > 0
        assert c.metadata["voice_id"] == "kigozi_lug"

    assert chunks[0].is_final is False
    assert chunks[1].is_final is True
