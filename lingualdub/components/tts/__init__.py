# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Tts components.

This package contains the base interface for tts components and any
built-in implementations shipped with the framework. Third-party tts
implementations are registered through the extension manifest system
and do not need to live in this package.
"""

from lingualdub.components.tts.base import FittingStrategy, TTSComponent
from lingualdub.components.tts.dummy import DummyTTSComponent
from lingualdub.components.tts.mms_tts import MMSTTSComponent
from lingualdub.components.tts.omnivoice import OmniVoiceTTSComponent
from lingualdub.components.tts.sherpa_mms import SherpaMMSTTSComponent
from lingualdub.components.tts.sunbird import SunbirdTTSComponent
from lingualdub.components.tts.voice_conditioned import VoiceConditionedTTSComponent

__all__: list[str] = [
    "FittingStrategy",
    "TTSComponent",
    "DummyTTSComponent",
    "MMSTTSComponent",
    "OmniVoiceTTSComponent",
    "SherpaMMSTTSComponent",
    "SunbirdTTSComponent",
    "VoiceConditionedTTSComponent",
]
