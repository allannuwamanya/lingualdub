# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for African expressive cues and SSML parser.
"""

from lingualdub.expression.ssml import SSMLParser


def test_ssml_parser_plain_text():
    segments = SSMLParser.parse("Twebaza nnyo emirimu gyammwe.")
    assert len(segments) == 1
    assert segments[0].text == "Twebaza nnyo emirimu gyammwe."
    assert segments[0].emotion == "neutral"
    assert segments[0].pitch_semitones == 0.0
    assert segments[0].rate_multiplier == 1.0


def test_ssml_parser_emotion_bracket_cues():
    text = "[excited] Tusanyuse nnyo okukulaba! [whisper] Naye pulani zaffe zikweke."
    segments = SSMLParser.parse(text)
    assert len(segments) == 2

    assert segments[0].text == "Tusanyuse nnyo okukulaba!"
    assert segments[0].emotion == "excited"
    assert segments[0].pitch_semitones > 0
    assert segments[0].rate_multiplier > 1.0

    assert segments[1].text == "Naye pulani zaffe zikweke."
    assert segments[1].emotion == "whisper"
    assert segments[1].pitch_semitones < 0
    assert segments[1].volume_gain_db < 0


def test_ssml_parser_pause_and_break_tags():
    text = "Ekisooka, laba wano. [pause: 300ms] Eky'okubiri, <break time='1s'/> genda eyo."
    segments = SSMLParser.parse(text)
    assert len(segments) == 3
    assert segments[0].text == "Ekisooka, laba wano."
    assert segments[0].pause_after_ms == 300.0

    assert segments[1].text == "Eky'okubiri,"
    assert segments[1].pause_after_ms == 1000.0

    assert segments[2].text == "genda eyo."
    assert segments[2].pause_after_ms == 0.0
