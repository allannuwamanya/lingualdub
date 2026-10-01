# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
African expressive cues and SSML parser.

Parses inline emotional markers ([excited], [whisper], [respectful], [sorrow])
and SSML prosody tags to derive speech rate multipliers, pitch shifts, and pauses.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

EMOTION_ACOUSTIC_PROFILES = {
    "excited": {"pitch_semitones": 2.5, "rate_multiplier": 1.15, "volume_gain_db": 1.5},
    "whisper": {"pitch_semitones": -1.0, "rate_multiplier": 0.90, "volume_gain_db": -4.0},
    "respectful": {"pitch_semitones": -1.5, "rate_multiplier": 0.92, "volume_gain_db": -0.5},
    "sorrow": {"pitch_semitones": -2.0, "rate_multiplier": 0.85, "volume_gain_db": -2.0},
    "urgent": {"pitch_semitones": 2.0, "rate_multiplier": 1.25, "volume_gain_db": 2.0},
    "neutral": {"pitch_semitones": 0.0, "rate_multiplier": 1.00, "volume_gain_db": 0.0},
}

# Regex to match bracket cues like [excited], [whisper], [pause: 300ms], [break: 1s]
CUE_PATTERN = re.compile(
    r"\[(?:(excited|whisper|respectful|sorrow|urgent|neutral)|(?:pause|break):\s*(\d+(?:\.\d+)?)\s*(ms|s)?)\]",
    re.IGNORECASE,
)

# Regex to match basic XML SSML <break time="..."/> tags
SSML_BREAK_PATTERN = re.compile(r'<break\s+time=["\'](\d+(?:\.\d+)?)(ms|s)["\']\s*/?>', re.IGNORECASE)


@dataclass(frozen=True)
class ExpressiveSegment:
    """A segment of text accompanied by expressive acoustic parameters."""

    text: str
    emotion: str = "neutral"
    pitch_semitones: float = 0.0
    rate_multiplier: float = 1.0
    volume_gain_db: float = 0.0
    pause_after_ms: float = 0.0


class SSMLParser:
    """
    Parses conversational text annotated with expressive emotion markers or SSML pauses.
    """

    @classmethod
    def parse(cls, input_text: str) -> list[ExpressiveSegment]:
        """
        Parse annotated text into a sequence of ExpressiveSegments.
        """
        # First standardize SSML <break time="..."/> into bracket format
        def _ssml_break_repl(m: re.Match[str]) -> str:
            val = m.group(1)
            unit = m.group(2).lower()
            return f"[pause: {val}{unit}]"

        text = SSML_BREAK_PATTERN.sub(_ssml_break_repl, input_text)

        segments: list[ExpressiveSegment] = []
        current_emotion = "neutral"
        last_pos = 0

        for match in CUE_PATTERN.finditer(text):
            cue_start, cue_end = match.span()
            chunk = text[last_pos:cue_start].strip()

            emotion_cue = match.group(1)
            pause_val = match.group(2)
            pause_unit = match.group(3)

            if chunk:
                profile = EMOTION_ACOUSTIC_PROFILES.get(current_emotion, EMOTION_ACOUSTIC_PROFILES["neutral"])
                segments.append(
                    ExpressiveSegment(
                        text=chunk,
                        emotion=current_emotion,
                        pitch_semitones=profile["pitch_semitones"],
                        rate_multiplier=profile["rate_multiplier"],
                        volume_gain_db=profile["volume_gain_db"],
                        pause_after_ms=0.0,
                    )
                )

            if emotion_cue:
                current_emotion = emotion_cue.lower()
            elif pause_val:
                val = float(pause_val)
                pause_ms = val * 1000.0 if (pause_unit and pause_unit.lower() == "s") else val
                if segments:
                    # Attach pause to preceding segment
                    prev = segments[-1]
                    segments[-1] = ExpressiveSegment(
                        text=prev.text,
                        emotion=prev.emotion,
                        pitch_semitones=prev.pitch_semitones,
                        rate_multiplier=prev.rate_multiplier,
                        volume_gain_db=prev.volume_gain_db,
                        pause_after_ms=prev.pause_after_ms + pause_ms,
                    )

            last_pos = cue_end

        # Trailing text
        tail = text[last_pos:].strip()
        if tail:
            profile = EMOTION_ACOUSTIC_PROFILES.get(current_emotion, EMOTION_ACOUSTIC_PROFILES["neutral"])
            segments.append(
                ExpressiveSegment(
                    text=tail,
                    emotion=current_emotion,
                    pitch_semitones=profile["pitch_semitones"],
                    rate_multiplier=profile["rate_multiplier"],
                    volume_gain_db=profile["volume_gain_db"],
                    pause_after_ms=0.0,
                )
            )

        if not segments and input_text.strip():
            segments.append(ExpressiveSegment(text=input_text.strip()))

        return segments
