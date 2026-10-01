# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Curated African voice presets gallery.

Contains built-in voice profiles with synthetic anchor audio waveforms,
speaker embeddings, and verifiable consent certificates.
"""

from __future__ import annotations

import io
import wave
from typing import Any

from lingualdub.components.tts.shared import write_dummy_wav
from lingualdub.voices.pack import VoiceMetadata, VoicePack

# Standard curated African voice presets
AFRICAN_VOICE_PRESETS: dict[str, dict[str, Any]] = {
    "kigozi_lug": {
        "name": "Kigozi",
        "primary_language": "lug",
        "gender": "male",
        "dialect": "Central Luganda",
        "age_group": "adult",
        "style_tags": ["narrator", "documentary", "authoritative"],
        "description": "Deep resonant male voice tailored for Luganda audiobooks and narratives.",
        "pitch_freq": 160.0,
    },
    "namubiru_lug": {
        "name": "Namubiru",
        "primary_language": "lug",
        "gender": "female",
        "dialect": "Central Luganda",
        "age_group": "adult",
        "style_tags": ["warm", "storytelling", "conversational"],
        "description": "Warm and melodic female voice ideal for dialogue and educational dubbing.",
        "pitch_freq": 240.0,
    },
    "mugisha_nyn": {
        "name": "Mugisha",
        "primary_language": "nyn",
        "gender": "male",
        "dialect": "Ankole",
        "age_group": "elder",
        "style_tags": ["storyteller", "folklore", "deep"],
        "description": "Traditional elder male voice preserving Runyankole tonal nuances.",
        "pitch_freq": 140.0,
    },
    "kemigisha_nyn": {
        "name": "Kemigisha",
        "primary_language": "nyn",
        "gender": "female",
        "dialect": "Ankole",
        "age_group": "youth",
        "style_tags": ["dynamic", "conversational", "broadcast"],
        "description": "Bright and articulate female voice for Runyankole media and podcasts.",
        "pitch_freq": 260.0,
    },
    "amina_swa": {
        "name": "Amina",
        "primary_language": "swa",
        "gender": "female",
        "dialect": "Coastal Swahili",
        "age_group": "adult",
        "style_tags": ["news", "broadcast", "formal"],
        "description": "Crystal-clear Swahili broadcast voice with standard coastal pronunciation.",
        "pitch_freq": 220.0,
    },
    "juma_swa": {
        "name": "Juma",
        "primary_language": "swa",
        "gender": "male",
        "dialect": "East Africa",
        "age_group": "adult",
        "style_tags": ["conversational", "commercial", "friendly"],
        "description": "Engaging, conversational Swahili male voice suited for ads and dubbing.",
        "pitch_freq": 175.0,
    },
    "ade_yor": {
        "name": "Ade",
        "primary_language": "yor",
        "gender": "male",
        "dialect": "Lagos Yoruba",
        "age_group": "adult",
        "style_tags": ["expressive", "commercial", "energetic"],
        "description": "Dynamic Nigerian male voice with natural Yoruba tonal inflection.",
        "pitch_freq": 180.0,
    },
    "ngozi_ibo": {
        "name": "Ngozi",
        "primary_language": "ibo",
        "gender": "female",
        "dialect": "Enugu Igbo",
        "age_group": "youth",
        "style_tags": ["commercial", "friendly", "vibrant"],
        "description": "Vibrant and articulate Igbo female voice for modern media.",
        "pitch_freq": 250.0,
    },
    "zola_zul": {
        "name": "Zola",
        "primary_language": "zul",
        "gender": "male",
        "dialect": "KwaZulu-Natal",
        "age_group": "adult",
        "style_tags": ["resonant", "documentary", "deep"],
        "description": "Resonant isiZulu male voice with authentic click consonants and tone.",
        "pitch_freq": 150.0,
    },
}


def _generate_synthetic_reference_wav(freq_hz: float, duration_sec: float = 3.0) -> bytes:
    """Generate in-memory WAV bytes for reference audio anchor."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        # Use existing write_dummy_wav helper logic into temp file
        import tempfile
        from pathlib import Path

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
            temp_path = Path(tf.name)
        try:
            write_dummy_wav(temp_path, duration_sec=duration_sec, freq_hz=freq_hz, sample_rate=16000)
            return temp_path.read_bytes()
        finally:
            temp_path.unlink(missing_ok=True)


def list_presets(language: str | None = None) -> list[VoiceMetadata]:
    """Return metadata for all available curated presets."""
    results: list[VoiceMetadata] = []
    for vid, data in AFRICAN_VOICE_PRESETS.items():
        if language and data["primary_language"] != language:
            continue
        results.append(
            VoiceMetadata(
                voice_id=vid,
                name=data["name"],
                primary_language=data["primary_language"],
                consent_basis="curated_public_domain_synthetic_preset",
                gender=data["gender"],
                dialect=data["dialect"],
                age_group=data["age_group"],
                style_tags=data["style_tags"],
                description=data["description"],
            )
        )
    return results


def get_preset_voice(voice_id: str) -> VoicePack:
    """
    Construct a VoicePack for a named preset.
    """
    if voice_id not in AFRICAN_VOICE_PRESETS:
        raise KeyError(f"Preset voice {voice_id!r} not found. Available: {list(AFRICAN_VOICE_PRESETS.keys())}")

    data = AFRICAN_VOICE_PRESETS[voice_id]
    audio_bytes = _generate_synthetic_reference_wav(freq_hz=data["pitch_freq"])
    return VoicePack.create(
        voice_id=voice_id,
        name=data["name"],
        audio_path_or_bytes=audio_bytes,
        primary_language=data["primary_language"],
        consent_basis="curated_public_domain_synthetic_preset",
        gender=data["gender"],
        dialect=data["dialect"],
        age_group=data["age_group"],
        style_tags=data["style_tags"],
        description=data["description"],
    )
