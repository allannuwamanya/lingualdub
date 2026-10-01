# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for span-level audio content cache.
"""

from lingualdub.engines.cache import AudioContentCache, compute_cache_key


def test_compute_cache_key_deterministic():
    key1 = compute_cache_key(
        text="Oli otya nnyabo",
        voice_id="kigozi_lug",
        language="lug",
        speed=1.0,
        emotion="neutral",
    )
    key2 = compute_cache_key(
        text="Oli otya nnyabo",
        voice_id="kigozi_lug",
        language="lug",
        speed=1.0,
        emotion="neutral",
    )
    assert key1 == key2
    assert len(key1) == 64  # SHA256 hex length

    key_diff_speed = compute_cache_key(
        text="Oli otya nnyabo",
        voice_id="kigozi_lug",
        language="lug",
        speed=1.1,
    )
    assert key1 != key_diff_speed


def test_audio_content_cache_put_get(tmp_path):
    cache = AudioContentCache(cache_dir=tmp_path)
    key = compute_cache_key("Hello world", "v1", "eng")

    assert cache.has(key) is False
    assert cache.get(key) is None
    assert cache.misses == 1

    wav_bytes = b"RIFFcachedwavdata"
    saved_path = cache.put(key, wav_bytes)
    assert saved_path.exists()
    assert cache.has(key) is True

    retrieved = cache.get(key)
    assert retrieved is not None
    assert retrieved.read_bytes() == wav_bytes
    assert cache.hits == 1

    # Clear cache
    deleted = cache.clear()
    assert deleted == 1
    assert cache.has(key) is False
    assert cache.hits == 0
    assert cache.misses == 0
