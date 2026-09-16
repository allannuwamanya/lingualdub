# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Code_switch components.

This package contains the base interface for code_switch components and any
built-in implementations shipped with the framework. Third-party code_switch
implementations are registered through the extension manifest system
and do not need to live in this package.
"""

from lingualdub.components.code_switch.base import CodeSwitchComponent
from lingualdub.components.code_switch.blender import AudioBlendingComponent
from lingualdub.components.code_switch.dummy import DummyCodeSwitchComponent
from lingualdub.components.code_switch.heuristic import HeuristicLIDComponent
from lingualdub.components.code_switch.neural_lid import NeuralLIDComponent

__all__ = [
    "AudioBlendingComponent",
    "CodeSwitchComponent",
    "DummyCodeSwitchComponent",
    "HeuristicLIDComponent",
    "NeuralLIDComponent",
]
