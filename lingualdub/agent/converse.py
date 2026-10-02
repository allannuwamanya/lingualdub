# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Real-time conversational voice agent with barge-in interruption support.

Coordinates streaming Voice Activity Detection (VAD), ASR, LLM response,
and phrase-by-phrase low-latency TTS streaming for African languages.
"""

from __future__ import annotations

import logging
import threading
import time
from collections.abc import Callable, Iterator
from dataclasses import dataclass, field
from typing import Any

from lingualdub.api.streaming import AudioStreamChunk, stream_speech_chunks

logger = logging.getLogger(__name__)


@dataclass
class ConversationTurn:
    """A single turn in a conversational voice dialogue."""

    role: str  # 'user' or 'assistant'
    text: str
    audio_path: str | None = None
    timestamp: float = field(default_factory=time.time)
    metadata: dict[str, Any] = field(default_factory=dict)


class BargeInController:
    """
    Thread-safe barge-in interruption controller.

    Signals active audio synthesis and playback workers to truncate and stop
    the moment the user begins speaking.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._interrupted = False
        self._is_agent_speaking = False

    @property
    def is_interrupted(self) -> bool:
        with self._lock:
            return self._interrupted

    @property
    def is_agent_speaking(self) -> bool:
        with self._lock:
            return self._is_agent_speaking

    def start_speaking(self) -> None:
        """Mark that the agent has started streaming audio out."""
        with self._lock:
            self._is_agent_speaking = True
            self._interrupted = False

    def stop_speaking(self) -> None:
        """Mark that the agent has finished speaking."""
        with self._lock:
            self._is_agent_speaking = False

    def interrupt(self) -> bool:
        """
        Trigger a barge-in interruption event.

        Returns:
            True if the agent was speaking and was successfully interrupted.
        """
        with self._lock:
            if self._is_agent_speaking:
                self._interrupted = True
                self._is_agent_speaking = False
                logger.debug("Barge-in interruption triggered!")
                return True
            return False

    def reset(self) -> None:
        """Reset state for a new conversational turn."""
        with self._lock:
            self._interrupted = False
            self._is_agent_speaking = False


class ConversationalVoiceAgent:
    """
    Conversational Voice Agent supporting African languages with barge-in interruption.
    """

    def __init__(
        self,
        voice_id: str = "kigozi_lug",
        language: str = "lug",
        system_prompt: str = "Oli mubeezi w'ebyobulamu ow'ekisa.",
        llm_responder: Callable[[str, list[ConversationTurn]], str] | None = None,
    ) -> None:
        self.voice_id = voice_id
        self.language = language
        self.system_prompt = system_prompt
        self.history: list[ConversationTurn] = []
        self.barge_in = BargeInController()
        self.llm_responder = llm_responder or self._default_responder

    def _default_responder(self, user_text: str, history: list[ConversationTurn]) -> str:
        """Intelligent African conversational responder handling healthcare, greetings, and queries."""
        text_lower = user_text.lower().strip()

        # Luganda Health & Medical inquiries
        if any(
            w in text_lower
            for w in ("omutwe", "omubiri", "eddagala", "omusawo", "eddwaliro", "obulumi")
        ):
            return "Ntegedde obulumi bw'olina. Nsaba owummulemu katono, era osobole okulaba omusawo w'ebyobulamu mu ddwaliro eri okumpi naawe."

        # Swahili Health & Medical inquiries
        if any(
            w in text_lower
            for w in ("kichwa", "ugonjwa", "dawa", "daktari", "hospitali", "maumivu")
        ):
            return "Pole sana kwa hali unayopitia. Tafadhali pumzika vizuri na umuone daktari katika kituo cha afya kilicho karibu nawe."

        # Luganda Greetings
        if any(g in text_lower for g in ("oli otya", "wasuze", "ki kati", "osiibye", "gyendi")):
            return "Gyendi bulungi nnyabo/ssebo, tusanyuse nnyo okukwaniriza mu LingualDub. Nkuyambe ntya leero?"

        # Swahili Greetings
        if any(g in text_lower for g in ("hujambo", "habari", "mambo", "shikamoo")):
            return "Habari nzuri sana! Karibu katika mfumo wa kisasa wa sauti za Kiafrika. Naweza kukusaidia vipi leo?"

        # Runyankore Greetings
        if any(g in text_lower for g in ("agandi", "oriyo", "orire", "osiibire")):
            return "Ndi gye munonga, twakwakiire n'omutima gumwe omuri LingualDub. Ninkuyamba nta eriizooba?"

        # English Greetings & General Queries
        if any(g in text_lower for g in ("hello", "hi", "hey", "good morning", "good afternoon")):
            return "Hello and welcome to LingualDub Voice AI! I can converse with you in Luganda, Swahili, Runyankore, or English. How may I assist you today?"

        if self.language == "swa":
            return f"Nimekuelewa vizuri: '{user_text}'. Nipo hapa kukusaidia katika huduma yoyote ya sauti na lugha."
        elif self.language == "nyn":
            return f"Nnyetegyereize gye: '{user_text}'. Ndi aha kukuhwera omu by'amaraka n'endimi zaitu."
        return f"Ntegedde bulungi kye ngambye: '{user_text}'. Ndi wano okukuyamba ku buli kimu ekikwata ku maloboozi n'ennimi zaffe."

    def user_speaks(self, text: str) -> None:
        """Record user speech and trigger barge-in if agent is speaking."""
        self.barge_in.interrupt()
        self.history.append(ConversationTurn(role="user", text=text))

    def respond_stream(self, user_text: str | None = None) -> Iterator[AudioStreamChunk]:
        """
        Generate agent reply and stream audio chunks with barge-in cancellation.
        """
        if user_text:
            self.user_speaks(user_text)

        reply_text = self.llm_responder(self.history[-1].text if self.history else "", self.history)
        self.history.append(ConversationTurn(role="assistant", text=reply_text))

        self.barge_in.start_speaking()

        try:
            for chunk in stream_speech_chunks(
                text=reply_text,
                voice_id=self.voice_id,
                language=self.language,
            ):
                if self.barge_in.is_interrupted:
                    logger.info("Response stream halted due to user barge-in.")
                    break
                yield chunk
        finally:
            self.barge_in.stop_speaking()
