# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
African phonetic and tonal pronunciation dictionary.

Provides Grapheme-to-Phoneme (G2P) normalizations, tonal contour annotations,
and phonetic respellings for African proper names, locations, and loanwords.
"""

from __future__ import annotations

import re

# Curated regional proper names, places, and loanword phonetic respellings
DEFAULT_AFRICAN_PHONETIC_LEXICON: dict[str, dict[str, str]] = {
    "lug": {
        # Cities and locations
        "kampala": "Ka-m-pa-la",
        "entebbe": "E-n-te-bbe",
        "jinja": "Ji-nja",
        "mbarara": "Mba-ra-ra",
        "gulu": "Gu-lu",
        "mukono": "Mu-ko-no",
        "masaka": "Ma-sa-ka",
        # Common proper names
        "museveni": "Mu-se-ve-ni",
        "kabaka": "Ka-ba-ka",
        "kiiza": "Kii-za",
        "namaganda": "Na-ma-ga-nda",
        "mugisha": "Mu-gi-sha",
        "kigozi": "Ki-go-zi",
        # Modern loanwords and tech terms
        "kompyuta": "ko-m-pyu-ta",
        "essimu": "e-ssi-mu",
        "intaneeti": "i-n-ta-nee-ti",
        "bbanka": "bba-n-ka",
        "motoka": "mo-to-ka",
    },
    "swa": {
        "nairobi": "Na-i-ro-bi",
        "mombasa": "Mo-m-ba-sa",
        "dar es salaam": "Da-r e-s Sa-laa-m",
        "zanzibar": "Za-n-zi-ba-r",
        "arusha": "A-ru-sha",
        "kigali": "Ki-ga-li",
        "dodoma": "Do-do-ma",
        "simu": "si-mu",
        "tarakilishi": "ta-ra-ki-li-shi",
        "wavuti": "wa-vu-ti",
    },
    "yor": {
        "lagos": "Èkó",
        "ibadan": "Ìbàdàn",
        "abuja": "A-bu-ja",
        "abeokuta": "A-bé-ò-kú-ta",
        "babatunde": "Bàbátúndé",
        "olumide": "Olúmìdé",
    },
    "ibo": {
        "enugu": "È-nú-gwu",
        "onitsha": "Ọ̀nị̀cha",
        "owerri": "Òwèré",
        "chinua": "Chínúà",
        "emeka": "Èméká",
    },
}

# Regex to detect Bantu geminate consonants (Luganda: bb, dd, gg, kk, mm, nn, pp, ss, tt)
GEMINATE_PATTERN = re.compile(r"\b([a-zA-Z]*)([bdgkm npst])\2([a-zA-Z]*)\b", re.IGNORECASE)


class PronunciationDictionary:
    """
    Manages custom African phonetic respellings and tonal adjustments for TTS.
    """

    def __init__(self, custom_lexicon: dict[str, dict[str, str]] | None = None) -> None:
        self.lexicon: dict[str, dict[str, str]] = {}
        # Load defaults
        for lang, words in DEFAULT_AFRICAN_PHONETIC_LEXICON.items():
            self.lexicon[lang] = dict(words)

        # Merge custom
        if custom_lexicon:
            for lang, words in custom_lexicon.items():
                if lang not in self.lexicon:
                    self.lexicon[lang] = {}
                self.lexicon[lang].update(words)

    def add_entry(self, word: str, phonetic: str, language: str = "lug") -> None:
        """Register or override a phonetic respelling."""
        lang_dict = self.lexicon.setdefault(language.lower(), {})
        lang_dict[word.lower().strip()] = phonetic.strip()

    def get_phonetic(self, word: str, language: str = "lug") -> str | None:
        """Look up phonetic respelling for a single word."""
        lang_dict = self.lexicon.get(language.lower(), {})
        return lang_dict.get(word.lower().strip())

    def normalize_text(self, text: str, language: str = "lug") -> str:
        """
        Replace known proper nouns and loanwords with phonetically tuned representations.
        """
        lang_dict = self.lexicon.get(language.lower(), {})
        if not lang_dict:
            return text

        words = text.split()
        normalized_words: list[str] = []

        for w in words:
            # Strip trailing punctuation for dictionary check
            match = re.match(r"^([^\w]*)([\w'-]+)([^\w]*)$", w, re.UNICODE)
            if match:
                prefix, core, suffix = match.groups()
                core_lower = core.lower()
                if core_lower in lang_dict:
                    normalized_words.append(f"{prefix}{lang_dict[core_lower]}{suffix}")
                else:
                    normalized_words.append(w)
            else:
                normalized_words.append(w)

        return " ".join(normalized_words)

    def annotate_tone_contour(self, text: str, language: str = "lug") -> str:
        """
        Mark penultimate lengthening and geminate consonant tension for Bantu TTS.
        """

        # In Luganda, geminate consonants (bb, dd, kk, etc.) indicate a glottal hold / syllable weight
        def _highlight_geminates(match: re.Match[str]) -> str:
            prefix = match.group(1)
            char = match.group(2)
            suffix = match.group(3)
            # Insert hyphen separator to guide neural TTS syllabification
            return f"{prefix}{char}-{char}{suffix}"

        if language.lower() in ("lug", "nyn"):
            return GEMINATE_PATTERN.sub(_highlight_geminates, text)
        return text
