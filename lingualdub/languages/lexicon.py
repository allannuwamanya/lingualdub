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
}


def translate_with_lexicon(text: str, source_language: str, target_language: str) -> str:
    """
    Translate text using curated African lexicon and phrase patterns.
    """
    cleaned = text.strip()
    norm = re.sub(r"[^\w\s]", "", cleaned.lower()).strip()

    # 1. Exact or longest phrase match first
    sorted_phrases = sorted(PHRASE_TRANSLATIONS.items(), key=lambda item: len(item[0]), reverse=True)
    for phrase, lang_map in sorted_phrases:
        if (norm == phrase or norm.startswith(phrase)) and target_language in lang_map:
            return lang_map[target_language]



    # 2. Word by word replacement with Bantu syntax preservation
    words = cleaned.split()
    translated_words = []
    for w in words:
        clean_w = re.sub(r"[^\w]", "", w.lower())
        punct = w[len(clean_w):] if len(clean_w) < len(w) else ""
        if clean_w in WORD_DICTIONARY and target_language in WORD_DICTIONARY[clean_w]:
            translated_words.append(WORD_DICTIONARY[clean_w][target_language] + punct)
        else:
            translated_words.append(w)

    return " ".join(translated_words)
