# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for African phonetic dictionary and Bantu tone contouring.
"""

from lingualdub.expression.pronunciation import PronunciationDictionary


def test_pronunciation_dict_lookup():
    pdict = PronunciationDictionary()
    assert pdict.get_phonetic("Kampala", language="lug") == "Ka-m-pa-la"
    assert pdict.get_phonetic("Nairobi", language="swa") == "Na-i-ro-bi"
    assert pdict.get_phonetic("Lagos", language="yor") == "Èkó"
    assert pdict.get_phonetic("UnknownPlace", language="lug") is None


def test_pronunciation_dict_normalize_text():
    pdict = PronunciationDictionary()
    raw = "Tugenda mu Kampala enkya okugula essimu."
    normalized = pdict.normalize_text(raw, language="lug")
    assert "Ka-m-pa-la" in normalized
    assert "e-ssi-mu." in normalized


def test_pronunciation_dict_custom_entry():
    pdict = PronunciationDictionary()
    pdict.add_entry("Ntinda", "Nti-n-da", language="lug")
    assert pdict.get_phonetic("ntinda", language="lug") == "Nti-n-da"

    res = pdict.normalize_text("Tusangibwa Ntinda", language="lug")
    assert "Nti-n-da" in res


def test_pronunciation_annotate_tone_contour():
    pdict = PronunciationDictionary()
    text = "Tugenda Entebbe leero"
    contoured = pdict.annotate_tone_contour(text, language="lug")
    # Entebbe has geminate 'bb' -> 'Enteb-be'
    assert "teb-be" in contoured
