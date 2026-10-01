# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Conversational voice agent package for interactive low-latency dialogues.
"""

from __future__ import annotations

from lingualdub.agent.converse import (
    BargeInController,
    ConversationalVoiceAgent,
    ConversationTurn,
)

__all__ = [
    "BargeInController",
    "ConversationTurn",
    "ConversationalVoiceAgent",
]
