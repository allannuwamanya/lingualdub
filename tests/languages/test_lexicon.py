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


def test_lexicon_bidirectional_and_cross_language():
    # Luganda to English
    res_lug_eng = translate_with_lexicon("Nnumwa omutwe, njagala eddagala", "lug", "eng")
    assert "headache" in res_lug_eng.lower()
    assert "medicine" in res_lug_eng.lower()

    # Luganda to Swahili
    res_lug_swa = translate_with_lexicon("Nnumwa omutwe, njagala eddagala", "lug", "swa")
    assert "kichwa" in res_lug_swa.lower()
    assert "dawa" in res_lug_swa.lower()

    # Swahili to Luganda
    res_swa_lug = translate_with_lexicon("Hujambo", "swa", "lug")
    assert "Oli otya" in res_swa_lug

    # Reverse word translation
    word_rev = translate_with_lexicon("omusawo eddagala", "lug", "eng")
    assert "doctor" in word_rev
    assert "medicine" in word_rev


def test_lexicon_agriculture_domain():
    # Rainy season inquiry
    trans_swa = translate_with_lexicon("When does the rainy season begin?", "eng", "swa")
    assert "mvua" in trans_swa.lower()

    # Fertilizer application in Luganda
    trans_lug = translate_with_lexicon("Apply fertilizer after two weeks", "eng", "lug")
    assert "ebijimusa" in trans_lug.lower()

    # Market price of maize in Hausa
    trans_hau = translate_with_lexicon("The market price of maize is high today", "eng", "hau")
    assert "masara" in trans_hau.lower()


def test_lexicon_mobile_money_domain():
    # Secret PIN
    trans_lug = translate_with_lexicon("Enter your secret PIN to confirm transfer", "eng", "lug")
    assert "ekyama" in trans_lug.lower()

    # Account balance
    trans_swa = translate_with_lexicon("Your account balance is", "eng", "swa")
    assert "salio" in trans_swa.lower()

    # Money sent successfully
    trans_hau = translate_with_lexicon("Money sent successfully", "eng", "hau")
    assert "kudi" in trans_hau.lower()


def test_lexicon_emergency_health_domain():
    # Boil drinking water
    trans_lug = translate_with_lexicon("Boil drinking water before use", "eng", "lug")
    assert "amazzi" in trans_lug.lower()

    # Emergency ambulance in Swahili
    trans_swa = translate_with_lexicon("Call the emergency ambulance immediately", "eng", "swa")
    assert "wagonjwa" in trans_swa.lower()

    # Flooding warning in Yoruba
    trans_yor = translate_with_lexicon("Heavy rain and flooding expected tomorrow", "eng", "yor")
    assert "òjò" in trans_yor.lower()
