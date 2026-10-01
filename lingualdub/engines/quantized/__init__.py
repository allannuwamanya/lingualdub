# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Quantized local execution engines for low-resource environments (<1GB RAM, CPU-optimized).
"""

from __future__ import annotations

from lingualdub.engines.quantized.nllb_ct2 import CTranslate2NLLBEngine
from lingualdub.engines.quantized.omnivoice_gguf import OmniVoiceGGUFEngine
from lingualdub.engines.quantized.sherpa_mms import SherpaMMSEngine
from lingualdub.engines.quantized.whisper_ct2 import FasterWhisperEngine

__all__ = [
    "CTranslate2NLLBEngine",
    "FasterWhisperEngine",
    "OmniVoiceGGUFEngine",
    "SherpaMMSEngine",
]
