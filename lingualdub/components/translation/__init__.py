# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Translation components.

This package contains the base interface for translation components and any
built-in implementations shipped with the framework. Third-party translation
implementations are registered through the extension manifest system
and do not need to live in this package.
"""

from lingualdub.components.translation.base import TranslationComponent
from lingualdub.components.translation.dummy import DummyTranslationComponent
from lingualdub.components.translation.hf_translator import HuggingFaceTranslationComponent
from lingualdub.components.translation.quantized_nllb import (
    QuantizedNLLBTranslationComponent,
)
from lingualdub.components.translation.sunbird import SunbirdTranslationComponent

__all__: list[str] = [
    "TranslationComponent",
    "DummyTranslationComponent",
    "HuggingFaceTranslationComponent",
    "SunbirdTranslationComponent",
    "QuantizedNLLBTranslationComponent",
]
