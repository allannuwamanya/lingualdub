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
        "hau": "Ina bukatar likita",
    },
    # Agriculture & Agritech Domain
    "when does the rainy season begin": {
        "lug": "Enkuba etandika ddi okutonnya?",
        "swa": "Msimu wa mvua unaanza lini?",
        "nyn": "Enjura etandika ryari kugwa?",
        "hau": "Yaushe lokacin damina zai fara?",
        "yor": "Ìgbà wo ni àkókò òjò ń bẹ̀rẹ̀?",
        "ibo": "Kedu mgbe oge udu mmiri ga-amalite?",
        "zul": "Isikhathi semvula siqala nini?",
    },
    "apply fertilizer after two weeks": {
        "lug": "Teekamu ebijimusa oluvanyuma lwa wiiki bbiri",
        "swa": "Weka mbolea baada ya wiki mbili",
        "nyn": "Kozesa ebirikugimisa bwanyima y'ebiro ikumi na bina",
        "hau": "Zuba takin zamani bayan makonni biyu",
        "yor": "Fi ajílẹ̀ sí i lẹ́yìn ọ̀sẹ̀ méjì",
        "ibo": "Tinye fatịlaịza mgbe izu abụọ gachara",
        "zul": "Faka umquba ngemuva kwamasonto amabili",
    },
    "the market price of maize is high today": {
        "lug": "Omuwendo gw'ebikwaso kasooli gulinnye nnyo leero",
        "swa": "Bei ya mahindi sokoni iko juu sana leo",
        "nyn": "Ebeeyi y'ebicoori aha katale eri heiguru eriizooba",
        "hau": "Farashin masara a kasuwa ya yi yawa a yau",
        "yor": "Iye àgbàdo lórí ọjà ga lónìí",
        "ibo": "Ọnụ ahịa ọka dị elu n'ahịa taa",
        "zul": "Intengo yombila iphezulu kakhulu namuhla",
    },
    "water the crops early in the morning": {
        "lug": "Fukirira ebirime mu makya g'ennyo",
        "swa": "Nywesha mazao maji asubuhi na mapema",
        "nyn": "Itirira ebihingwa amaizi omu kasheeshe",
        "hau": "Shayar da amfanin gona da safe",
        "yor": "Rọ omi sí àwọn ohun ọ̀gbìn ní kùtùkùtù òwúrọ̀",
        "ibo": "Gbaa ihe ọkụkụ mmiri n'isi ụtụtụ",
        "zul": "Chelela izitshalo ekuseni kakhulu",
    },
    # Mobile Money & Financial Inclusion Domain
    "enter your secret pin to confirm transfer": {
        "lug": "Yingiza ennamba yo ey'ekyama okukakasa ensimbi",
        "swa": "Ingiza nambari yako ya siri kuthibitisha utumaji wa fedha",
        "nyn": "Taamu enamba yaawe ey'ekyama kwemeza sente",
        "hau": "Shigar da lambar sirrinka don tabbatar da tura kudi",
        "yor": "Tẹ nọ́ńbà ìkọ̀kọ̀ rẹ láti fọwọ́sí ìfoworánṣẹ́",
        "ibo": "Tinye nọmba nzuzo gị iji kwado nnyefe ego",
        "zul": "Faka iphinikhodi yakho eyimfihlo ukuze uqinisekise ukudlulisa imali",
    },
    "your account balance is": {
        "lug": "Ensimbi ezisigaddeko ku akawunti yo ziri",
        "swa": "Salio la akaunti yako ni",
        "nyn": "Esente eziri aha akaunti yaawe ni",
        "hau": "Kudin da ke cikin asusunka shi ne",
        "yor": "Iye owó tó wà nínú àkópọ̀ rẹ ni",
        "ibo": "Ego fọdụrụ na akaụntụ gị bụ",
        "zul": "Ibhalansi ye-akhawunti yakho ngu",
    },
    "money sent successfully": {
        "lug": "Ensimbi ziweerezeddwa bulungi",
        "swa": "Pesa zimetumwa kikamilifu",
        "nyn": "Esente zoohereziibwe gye",
        "hau": "An tura kudi cikin nasara",
        "yor": "Owó ti lọ láṣeyọrí",
        "ibo": "Ezigara ego nke ọma",
        "zul": "Imali ithunyelwe ngempumelelo",
    },
    "insufficient funds to complete this transaction": {
        "lug": "Tolina nsimbi zimala okukola kino",
        "swa": "Huna salio la kutosha kukamilisha muamala huu",
        "nyn": "Toine sente zirikwija kukora eki",
        "hau": "Ba ka da isassun kudi don yin wannan ma'amala",
        "yor": "Owó rẹ kò tó láti parí iṣẹ́ yìí",
        "ibo": "Ego ezughị iji mezue azụmahịa a",
        "zul": "Imali ayenele ukuqeda lokhu okwenzayo",
    },
    # Emergency, Public Health & Weather Alerts Domain
    "boil drinking water before use": {
        "lug": "Fumba amazzi g'okunywa nga tonnagawa",
        "swa": "Chemsha maji ya kunywa kabla ya kutumia",
        "nyn": "Teeka amaizi g'okunywa kwoce gye otakaganywiri",
        "hau": "Tafasa ruwan sha kafin amfani da shi",
        "yor": "Bọ omi mímu kí o tó lò ó",
        "ibo": "Sie mmiri ọṅụṅụ tupu i jiri ya mee ihe",
        "zul": "Bilisa amanzi okuphuza ngaphambi kokuwasebenzisa",
    },
    "call the emergency ambulance immediately": {
        "lug": "Kuba essimu y'ebyobulamu ey'amangu amangwago",
        "swa": "Piga simu ya dharura ya gari la wagonjwa mara moja",
        "nyn": "Teera esimu y'amotoka y'amagara ahonaaho",
        "hau": "Kira motar daukar marasa lafiya ta gaggawa nan take",
        "yor": "Pe ọkọ̀ ètò ìwòsàn pàjáwìrì lẹ́sẹ̀kẹsẹ̀",
        "ibo": "Kpọọ ụgbọ ala mberede ozugbo",
        "zul": "Shayela i-ambulensi yezimo eziphuthumayo ngokushesha",
    },
    "heavy rain and flooding expected tomorrow": {
        "lug": "Enkuba y'amaanyi n'amataba bisuubirwa enkya",
        "swa": "Mvua kubwa na mafuriko yanatarajiwa kesho",
        "nyn": "Enjura y'amaani n'omutaba nibiteekateekwa nyencakare",
        "hau": "Ana sa ran ruwan sama mai karfi da ambaliyar ruwa gobe",
        "yor": "A ń retí òjò líle àti àkúnya omi ní ọ̀la",
        "ibo": "A na-atụ anya nnukwu mmiri ozuzo na ide mmiri echi",
        "zul": "Imvula enkulu nezikhukhula kulindeleke kusasa",
    },
}

WORD_DICTIONARY: dict[str, dict[str, str]] = {
    "doctor": {
        "lug": "omusawo",
        "swa": "daktari",
        "nyn": "omushaho",
        "yor": "dókítà",
        "ibo": "dọkịta",
        "zul": "udokotela",
        "hau": "likita",
    },
    "hospital": {
        "lug": "eddwaliro",
        "swa": "hospitali",
        "nyn": "irwariro",
        "yor": "ilé-ìwòsàn",
        "ibo": "ụlọ ọgwụ",
        "zul": "isibhedlela",
        "hau": "asibiti",
    },
    "clinic": {
        "lug": "eddwaliro",
        "swa": "kliniki",
        "nyn": "eddwaliro",
        "yor": "ilé-ìwòsàn",
        "ibo": "ụlọ ọgwụ",
        "zul": "umtholampilo",
        "hau": "asibiti",
    },
    "medicine": {
        "lug": "eddagala",
        "swa": "dawa",
        "nyn": "omubazi",
        "yor": "oògùn",
        "ibo": "ọgwụ",
        "zul": "umuthi",
        "hau": "magani",
    },
    "water": {
        "lug": "amazzi",
        "swa": "maji",
        "nyn": "amaizi",
        "yor": "omi",
        "ibo": "mmiri",
        "zul": "amanzi",
        "hau": "ruwa",
    },
    "food": {
        "lug": "emmere",
        "swa": "chakula",
        "nyn": "ebyokurya",
        "yor": "oúnjẹ",
        "ibo": "nri",
        "zul": "ukudla",
        "hau": "abinci",
    },
    "child": {
        "lug": "omwana",
        "swa": "mtoto",
        "nyn": "omwojo",
        "yor": "ọmọ",
        "ibo": "nwa",
        "zul": "umntwana",
        "hau": "yaro",
    },
    "children": {
        "lug": "abaana",
        "swa": "watoto",
        "nyn": "abaana",
        "yor": "àwọn ọmọ",
        "ibo": "ụmụaka",
        "zul": "abantwana",
        "hau": "yara",
    },
    "today": {
        "lug": "leero",
        "swa": "leo",
        "nyn": "eriizooba",
        "yor": "lónìí",
        "ibo": "taa",
        "zul": "namuhla",
        "hau": "yau",
    },
    "tomorrow": {
        "lug": "enkya",
        "swa": "kesho",
        "nyn": "nyencakare",
        "yor": "ọ̀la",
        "ibo": "echi",
        "zul": "kusasa",
        "hau": "gobe",
    },
    "yesterday": {
        "lug": "eggulo",
        "swa": "jana",
        "nyn": "nyomwebazyo",
        "yor": "àná",
        "ibo": "nyaahụ",
        "zul": "izolo",
        "hau": "jiya",
    },
    "help": {
        "lug": "obuyambi",
        "swa": "msaada",
        "nyn": "obuyambi",
        "yor": "ìrànwọ́",
        "ibo": "enyemaka",
        "zul": "usizo",
        "hau": "taimako",
    },
    "name": {
        "lug": "erinnya",
        "swa": "jina",
        "nyn": "eiziina",
        "yor": "orúkọ",
        "ibo": "aha",
        "zul": "igama",
        "hau": "suna",
    },
    "people": {
        "lug": "abantu",
        "swa": "watu",
        "nyn": "abantu",
        "yor": "eniyan",
        "ibo": "ndị mmadụ",
        "zul": "abantu",
        "hau": "mutane",
    },
    "voice": {
        "lug": "eddoboozi",
        "swa": "sauti",
        "nyn": "eiraka",
        "yor": "ohùn",
        "ibo": "olu",
        "zul": "izwi",
        "hau": "murya",
    },
    "voices": {
        "lug": "amaloboozi",
        "swa": "sauti",
        "nyn": "amaraka",
        "yor": "àwọn ohùn",
        "ibo": "olu",
        "zul": "amazwi",
        "hau": "muryoyi",
    },
    "head": {
        "lug": "omutwe",
        "swa": "kichwa",
        "nyn": "omutwe",
        "yor": "orí",
        "ibo": "isi",
        "zul": "ikhanda",
        "hau": "kai",
    },
    "pain": {
        "lug": "obulumi",
        "swa": "maumivu",
        "nyn": "obusaasi",
        "yor": "ìrora",
        "ibo": "mgbu",
        "zul": "ubuhlungu",
        "hau": "ciwo",
    },
    "fever": {
        "lug": "omusujja",
        "swa": "homa",
        "nyn": "omuswija",
        "yor": "ibà",
        "ibo": "ahụ ọkụ",
        "zul": "imfiva",
        "hau": "zazzabi",
    },
    "money": {
        "lug": "ensimbi",
        "swa": "pesa",
        "nyn": "esente",
        "yor": "owó",
        "ibo": "ego",
        "zul": "imali",
        "hau": "kudi",
    },
    "rain": {
        "lug": "enkuba",
        "swa": "mvua",
        "nyn": "enjura",
        "yor": "òjò",
        "ibo": "mmiri ozuzo",
        "zul": "imvula",
        "hau": "ruwan sama",
    },
    "farmer": {
        "lug": "omulimi",
        "swa": "mkulima",
        "nyn": "omuhinzi",
        "yor": "àgbẹ̀",
        "ibo": "onye ọrụ ugbo",
        "zul": "umlimi",
        "hau": "manomi",
    },
    "market": {
        "lug": "akatale",
        "swa": "soko",
        "nyn": "akatale",
        "yor": "ọjà",
        "ibo": "ahịa",
        "zul": "imakethe",
        "hau": "kasuwa",
    },
    "price": {
        "lug": "omuwendo",
        "swa": "bei",
        "nyn": "ebeeyi",
        "yor": "iye",
        "ibo": "ọnụ ahịa",
        "zul": "intengo",
        "hau": "farashi",
    },
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
    sorted_phrases = sorted(
        PHRASE_TRANSLATIONS.items(), key=lambda item: len(item[0]), reverse=True
    )

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
        for _src_lang, src_val in lang_map.items():
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
        punct = w[len(clean_w) :] if len(clean_w) < len(w) else ""
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
                for _s_lang, s_val in lang_dict.items():
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
