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
    "funke_yor": {
        "name": "Funke",
        "primary_language": "yor",
        "gender": "female",
        "dialect": "Ibadan Yoruba",
        "age_group": "adult",
        "style_tags": ["warm", "melodic", "storytelling"],
        "description": "Warm, articulate Yoruba female voice with authentic tonal cadence.",
        "pitch_freq": 235.0,
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
    "chukwudi_ibo": {
        "name": "Chukwudi",
        "primary_language": "ibo",
        "gender": "male",
        "dialect": "Owerri Igbo",
        "age_group": "adult",
        "style_tags": ["confident", "narrator", "authoritative"],
        "description": "Rich and authoritative Igbo male voice for news and narration.",
        "pitch_freq": 165.0,
    },
    "danladi_hau": {
        "name": "Danladi",
        "primary_language": "hau",
        "gender": "male",
        "dialect": "Kano Hausa",
        "age_group": "adult",
        "style_tags": ["deep", "traditional", "calm"],
        "description": "Calm, resonant Hausa male voice with Northern Nigerian cadence.",
        "pitch_freq": 155.0,
    },
    "fatima_hau": {
        "name": "Fatima",
        "primary_language": "hau",
        "gender": "female",
        "dialect": "Kaduna Hausa",
        "age_group": "youth",
        "style_tags": ["bright", "conversational", "educational"],
        "description": "Bright and friendly Hausa female voice for educational dialogue.",
        "pitch_freq": 245.0,
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
    "thandeka_zul": {
        "name": "Thandeka",
        "primary_language": "zul",
        "gender": "female",
        "dialect": "Gauteng / Urban Zulu",
        "age_group": "youth",
        "style_tags": ["dynamic", "expressive", "youthful"],
        "description": "Expressive isiZulu female voice with modern South African vocal style.",
        "pitch_freq": 240.0,
    },
    "bekele_amh": {
        "name": "Bekele",
        "primary_language": "amh",
        "gender": "male",
        "dialect": "Addis Ababa Amharic",
        "age_group": "adult",
        "style_tags": ["formal", "narrator", "dignified"],
        "description": "Dignified Amharic male voice for formal broadcasts and documentaries.",
        "pitch_freq": 160.0,
    },
    "selam_amh": {
        "name": "Selam",
        "primary_language": "amh",
        "gender": "female",
        "dialect": "Shewa Amharic",
        "age_group": "adult",
        "style_tags": ["gentle", "poetic", "clear"],
        "description": "Gentle and clear Ethiopian female voice for audiobooks and media.",
        "pitch_freq": 230.0,
    },
    "warsame_som": {
        "name": "Warsame",
        "primary_language": "som",
        "gender": "male",
        "dialect": "Standard Northern Somali",
        "age_group": "adult",
        "style_tags": ["articulate", "news", "commanding"],
        "description": "Articulate Somali male voice for news reports and poetry recitation.",
        "pitch_freq": 170.0,
    },
    "deqa_som": {
        "name": "Deqa",
        "primary_language": "som",
        "gender": "female",
        "dialect": "Benadiri Somali",
        "age_group": "youth",
        "style_tags": ["lively", "conversational", "friendly"],
        "description": "Lively Somali female voice for educational and interactive content.",
        "pitch_freq": 255.0,
    },
    "gasana_kin": {
        "name": "Gasana",
        "primary_language": "kin",
        "gender": "male",
        "dialect": "Kigali Kinyarwanda",
        "age_group": "adult",
        "style_tags": ["calm", "trustworthy", "podcast"],
        "description": "Trustworthy Rwandan male voice for podcasts and voiceovers.",
        "pitch_freq": 162.0,
    },
    "uwase_kin": {
        "name": "Uwase",
        "primary_language": "kin",
        "gender": "female",
        "dialect": "Southern Kinyarwanda",
        "age_group": "youth",
        "style_tags": ["melodic", "storyteller", "clear"],
        "description": "Melodic Kinyarwanda female voice preserving traditional Bantu cadence.",
        "pitch_freq": 238.0,
    },
    "modou_wol": {
        "name": "Modou",
        "primary_language": "wol",
        "gender": "male",
        "dialect": "Dakar Wolof",
        "age_group": "adult",
        "style_tags": ["rhythmic", "vibrant", "commercial"],
        "description": "Rhythmic Senegalese Wolof male voice suited for commercial dubbing.",
        "pitch_freq": 172.0,
    },
    "okello_ach": {
        "name": "Okello",
        "primary_language": "ach",
        "gender": "male",
        "dialect": "Gulu Acholi (Luo)",
        "age_group": "adult",
        "style_tags": ["grounded", "community", "folklore"],
        "description": "Grounded Northern Ugandan Acholi voice for public radio and storytelling.",
        "pitch_freq": 158.0,
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
