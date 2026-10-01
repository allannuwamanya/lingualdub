# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
African language linguistic lexicons and rule-based translation dictionaries.

Provides authentic translations across Luganda, Swahili, Runyankore, Yoruba, Igbo,
and Zulu for common conversational, clinical, and dubbing domains.
"""

from __future__ import annotations

import re

# Comprehensive phrase translations across major African languages
PHRASE_TRANSLATIONS: dict[str, dict[str, str]] = {
    # Greetings & Introductions
    "hello": {
        "lug": "Oli otya",
        "swa": "Hujambo",
        "nyn": "Agandi",
        "yor": "Ẹ ǹlẹ́ o",
        "ibo": "Ndị nkem",
        "zul": "Sawubona",
    },
    "how are you": {
        "lug": "Oli otya?",
        "swa": "U hali gani?",
        "nyn": "Oli ota?",
        "yor": "Bawo ni?",
        "ibo": "Kedu ka ị mere?",
        "zul": "Unjani?",
    },
    "i am fine": {
        "lug": "Gyendi bulungi",
        "swa": "Mimi ni mzima",
        "nyn": "Ndi gye",
        "yor": "Mo wa daadaa",
        "ibo": "Adị m mma",
        "zul": "Ngiyaphila",
    },
    "good morning": {
        "lug": "Wasuze otya nnyabo/ssebo",
        "swa": "Habari za asubuhi",
        "nyn": "Oraire ota",
        "yor": "Ẹ káàárọ̀",
        "ibo": "Ụtụtụ ọma",
        "zul": "Sawubona ekuseni",
    },
    "good evening": {
        "lug": "Osiibye otya",
        "swa": "Habari za jioni",
        "nyn": "Osiibire ota",
        "yor": "Ẹ kú ìrọ̀lẹ́",
        "ibo": "Mgbede ọma",
        "zul": "Kuhle kwantambama",
    },
    "welcome": {
        "lug": "Tukwanirizza nnyo",
        "swa": "Karibu sana",
        "nyn": "Tukwakiire n'omutima gumwe",
        "yor": "Ẹ káàbọ̀",
        "ibo": "Nnọọ nke ọma",
        "zul": "Siyakwamukela",
    },
    "thank you": {
        "lug": "Weebale nnyo",
        "swa": "Asante sana",
        "nyn": "Webare munonga",
        "yor": "E ṣeun pupọ",
        "ibo": "Dalu nke ukwuu",
        "zul": "Ngiyabonga kakhulu",
    },
    "please": {
        "lug": "Nsaba",
        "swa": "Tafadhali",
        "nyn": "Ninkushaba",
        "yor": "Ẹ jọ̀wọ́",
        "ibo": "Biko",
        "zul": "Sicela",
    },
    "goodbye": {
        "lug": "Weeraba, tuligana",
        "swa": "Kwaheri, tutaonana",
        "nyn": "Obe murungi",
        "yor": "O dábọ̀",
        "ibo": "Ka ọ dị",
        "zul": "Hamba kahle",
    },
    # Clinical & Healthcare Domain
    "welcome to the clinic": {
        "lug": "Tukwanirizza mu ddwaliro lyaffe ery'ebyobulamu",
        "swa": "Karibu katika kliniki yetu ya matibabu",
        "nyn": "Tukwakiire omu ddwaliro ry'amagara",
        "yor": "Ẹ káàbọ̀ sí ilé ìwòsàn wa",
        "ibo": "Nnọọ na ụlọ ọgwụ anyị",
        "zul": "Siyakwamukela emtholampilo wethu",
    },
    "please sit down while we register your information": {
        "lug": "Nsaba otuule wano nga bwe tuwandiika ebikukwatako",
        "swa": "Tafadhali keti hapa tunaposajili taarifa zako",
        "nyn": "Ninkushaba oshutame ahansi tube nituhandiika ebirikukukwataho",
        "yor": "Ẹ jọ̀wọ́ ẹ jókòó bí a ṣe ń gba àkọsílẹ̀ yín",
        "ibo": "Biko nọdụ ala ka anyị na-edebanye aha gị",
        "zul": "Sicela uhlale phansi ngenkathi sibhalisa imininingwane yakho",
    },
    "the doctor will see you shortly": {
        "lug": "Omusawo ajja kukubuuza mu kaseera katono",
        "swa": "Daktari atakuona hivi punde",
        "nyn": "Omushaho naija kukureeba hati-hati",
        "yor": "Dókítà yóò rí yín láìpẹ́",
        "ibo": "Dọkịta ga-ahụ gị n'oge na-adịghị anya",
        "zul": "Udokotela uzokubona maduze",
    },
    "do you have any pain": {
        "lug": "Olinayo obulumi bwonna mu mubiri?",
        "swa": "Je, una maumivu yoyote mwilini?",
        "nyn": "Oine obusaasi bwona omu mubiri?",
        "yor": "Ǹjẹ́ o ní ìrora kankan lára?",
        "ibo": "Ị nwere ihe mgbu ọ bụla?",
        "zul": "Ingabe kukhona ubuhlungu onabo?",
    },
    "take this medicine twice a day": {
        "lug": "Mira eddagala lino emirundi ebiri olunaku",
        "swa": "Kunywa dawa hii mara mbili kwa siku",
        "nyn": "Mera omubazi ogu emirundi ebiri aha izooba",
        "yor": "Lo oògùn yìí lẹ́ẹ̀mejì lójúmọ́",
        "ibo": "Ṅụọ ọgwụ a ugboro abụọ n'ụbọchị",
        "zul": "Thatha lo muthi kabili ngosuku",
    },
    "i have a headache, i need medicine": {
        "lug": "Nnumwa omutwe, njagala eddagala",
        "swa": "Naumwa na kichwa, ninahitaji dawa",
        "nyn": "Ninsaasibwa omutwe, ninyenda omubazi",
        "yor": "Orí ń fọ́ mi, mo nílò oògùn",
        "ibo": "Isi na-awa m, achọrọ m ọgwụ",
        "zul": "Ngiphathwa yikhanda, ngidinga umuthi",
    },
    "i have a headache": {
        "lug": "Nnumwa omutwe",
        "swa": "Naumwa na kichwa",
        "nyn": "Ninsaasibwa omutwe",
        "yor": "Orí ń fọ́ mi",
        "ibo": "Isi na-awa m",
        "zul": "Ngiphathwa yikhanda",
    },
    "i need medicine": {
        "lug": "Njagala eddagala",
        "swa": "Ninahitaji dawa",
        "nyn": "Ninyenda omubazi",
        "yor": "Mo nílò oògùn",
        "ibo": "Achọrọ m ọgwụ",
        "zul": "Ngidinga umuthi",
    },
    "i need a doctor": {
        "lug": "Njagala omusawo",
        "swa": "Ninahitaji daktari",
        "nyn": "Ninyenda omushaho",
        "yor": "Mo nílò dókítà",
        "ibo": "Achọrọ m dọkịta",
        "zul": "Ngidinga udokotela",
    },
}

WORD_DICTIONARY: dict[str, dict[str, str]] = {
    "doctor": {"lug": "omusawo", "swa": "daktari", "nyn": "omushaho", "yor": "dókítà", "ibo": "dọkịta", "zul": "udokotela"},
    "hospital": {"lug": "eddwaliro", "swa": "hospitali", "nyn": "irwariro", "yor": "ilé-ìwòsàn", "ibo": "ụlọ ọgwụ", "zul": "isibhedlela"},
    "clinic": {"lug": "eddwaliro", "swa": "kliniki", "nyn": "eddwaliro", "yor": "ilé-ìwòsàn", "ibo": "ụlọ ọgwụ", "zul": "umtholampilo"},
    "medicine": {"lug": "eddagala", "swa": "dawa", "nyn": "omubazi", "yor": "oògùn", "ibo": "ọgwụ", "zul": "umuthi"},
    "water": {"lug": "amazzi", "swa": "maji", "nyn": "amaizi", "yor": "omi", "ibo": "mmiri", "zul": "amanzi"},
    "food": {"lug": "emmere", "swa": "chakula", "nyn": "ebyokurya", "yor": "oúnjẹ", "ibo": "nri", "zul": "ukudla"},
    "child": {"lug": "omwana", "swa": "mtoto", "nyn": "omwojo", "yor": "ọmọ", "ibo": "nwa", "zul": "umntwana"},
    "children": {"lug": "abaana", "swa": "watoto", "nyn": "abaana", "yor": "àwọn ọmọ", "ibo": "ụmụaka", "zul": "abantwana"},
    "today": {"lug": "leero", "swa": "leo", "nyn": "eriizooba", "yor": "lónìí", "ibo": "taa", "zul": "namuhla"},
    "tomorrow": {"lug": "enkya", "swa": "kesho", "nyn": "nyencakare", "yor": "ọ̀la", "ibo": "echi", "zul": "kusasa"},
    "yesterday": {"lug": "eggulo", "swa": "jana", "nyn": "nyomwebazyo", "yor": "àná", "ibo": "nyaahụ", "zul": "izolo"},
    "help": {"lug": "obuyambi", "swa": "msaada", "nyn": "obuyambi", "yor": "ìrànwọ́", "ibo": "enyemaka", "zul": "usizo"},
    "name": {"lug": "erinnya", "swa": "jina", "nyn": "eiziina", "yor": "orúkọ", "ibo": "aha", "zul": "igama"},
    "people": {"lug": "abantu", "swa": "watu", "nyn": "abantu", "yor": "eniyan", "ibo": "ndị mmadụ", "zul": "abantu"},
    "voice": {"lug": "eddoboozi", "swa": "sauti", "nyn": "eiraka", "yor": "ohùn", "ibo": "olu", "zul": "izwi"},
    "voices": {"lug": "amaloboozi", "swa": "sauti", "nyn": "amaraka", "yor": "àwọn ohùn", "ibo": "olu", "zul": "amazwi"},
    "head": {"lug": "omutwe", "swa": "kichwa", "nyn": "omutwe", "yor": "orí", "ibo": "isi", "zul": "ikhanda"},
    "pain": {"lug": "obulumi", "swa": "maumivu", "nyn": "obusaasi", "yor": "ìrora", "ibo": "mgbu", "zul": "ubuhlungu"},
    "fever": {"lug": "omusujja", "swa": "homa", "nyn": "omuswija", "yor": "ibà", "ibo": "ahụ ọkụ", "zul": "imfiva"},
}


def _normalize(s: str) -> str:
    return re.sub(r"[^\w\s]", "", s.lower()).strip()


def translate_with_lexicon(text: str, source_language: str, target_language: str) -> str:
    """
    Translate text bidirectionally using curated African lexicon and phrase patterns.
    Supports English <-> African languages and cross-African translation.
    """
    cleaned = text.strip()
    norm = _normalize(cleaned)
    is_tgt_eng = target_language.lower() in ("eng", "en")

    # 1. Exact or longest phrase match (bidirectional)
    sorted_phrases = sorted(PHRASE_TRANSLATIONS.items(), key=lambda item: len(item[0]), reverse=True)

    # Check forward match (source is English)
    for phrase, lang_map in sorted_phrases:
        norm_phrase = _normalize(phrase)
        if norm == norm_phrase or norm.startswith(norm_phrase):
            if is_tgt_eng:
                return phrase.capitalize()
            if target_language in lang_map:
                return lang_map[target_language]

    # Check reverse / cross-language match (source is African language)
    for phrase, lang_map in sorted_phrases:
        for src_lang, src_val in lang_map.items():
            norm_val = _normalize(src_val)
            if norm == norm_val or norm.startswith(norm_val):
                if is_tgt_eng:
                    return phrase.capitalize()
                if target_language in lang_map:
                    return lang_map[target_language]

    # 2. Word by word replacement with bidirectional dictionary
    words = cleaned.split()
    translated_words = []
    for w in words:
        clean_w = re.sub(r"[^\w]", "", w.lower())
        punct = w[len(clean_w):] if len(clean_w) < len(w) else ""
        matched = False

        # Forward match (English word)
        if clean_w in WORD_DICTIONARY:
            if is_tgt_eng:
                translated_words.append(clean_w + punct)
                matched = True
            elif target_language in WORD_DICTIONARY[clean_w]:
                translated_words.append(WORD_DICTIONARY[clean_w][target_language] + punct)
                matched = True

        # Reverse match (African word)
        if not matched:
            for eng_word, lang_dict in WORD_DICTIONARY.items():
                for s_lang, s_val in lang_dict.items():
                    if clean_w == _normalize(s_val):
                        if is_tgt_eng:
                            translated_words.append(eng_word + punct)
                            matched = True
                            break
                        elif target_language in lang_dict:
                            translated_words.append(lang_dict[target_language] + punct)
                            matched = True
                            break
                if matched:
                    break

        if not matched:
            translated_words.append(w)

    return " ".join(translated_words)
