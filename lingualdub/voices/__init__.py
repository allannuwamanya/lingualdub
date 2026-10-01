# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
African Voice Profiles and Voice Cloning package.

Provides the .afrivoice container specification, local voice store,
and curated African voice presets gallery.
"""

from __future__ import annotations

from lingualdub.voices.gallery import (
    AFRICAN_VOICE_PRESETS,
    get_preset_voice,
    list_presets,
)
from lingualdub.voices.pack import VoiceMetadata, VoicePack, VoicePackError
from lingualdub.voices.store import VoiceStore

__all__ = [
    "VoiceMetadata",
    "VoicePack",
    "VoicePackError",
    "VoiceStore",
    "AFRICAN_VOICE_PRESETS",
    "get_preset_voice",
    "list_presets",
]
