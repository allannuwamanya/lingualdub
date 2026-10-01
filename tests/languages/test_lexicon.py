# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

from lingualdub.languages.lexicon import translate_with_lexicon


def test_lexicon_phrase_translation():
    # Greetings
    assert "Oli otya" in translate_with_lexicon("Hello", "eng", "lug")
    assert "Hujambo" in translate_with_lexicon("Hello", "eng", "swa")
    assert "Agandi" in translate_with_lexicon("Hello", "eng", "nyn")
    assert "Sawubona" in translate_with_lexicon("Hello", "eng", "zul")

    # Clinic phrase
    assert "ddwaliro" in translate_with_lexicon("Welcome to the clinic", "eng", "lug")
    assert "kliniki" in translate_with_lexicon("Welcome to the clinic", "eng", "swa")


def test_lexicon_word_translation():
    trans_lug = translate_with_lexicon("doctor hospital medicine", "eng", "lug")
    assert "omusawo" in trans_lug
    assert "eddwaliro" in trans_lug
    assert "eddagala" in trans_lug

    trans_swa = translate_with_lexicon("doctor hospital medicine", "eng", "swa")
    assert "daktari" in trans_swa
    assert "hospitali" in trans_swa
    assert "dawa" in trans_swa


def test_lexicon_unknown_fallback():
    result = translate_with_lexicon("xyz123 unusual_term", "eng", "lug")
    assert "xyz123" in result
    assert "unusual_term" in result
