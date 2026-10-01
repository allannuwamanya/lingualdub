# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0
# Internal — not part of public API

"""
NLLB language code mappings — single source of truth for translation components.

Previously duplicated between hf_translator.py and sunbird.py with diverging keys.
"""

# ISO 639-1/3 -> NLLB 200 code mapping for supported low-resource languages.
# Extend here; all translation components should import from this module.
NLLB_CODE_MAP: dict[str, str] = {
    "eng": "eng_Latn",
    "lug": "lug_Latn",
    "nyn": "nyn_Latn",
    "swa": "swh_Latn",
    "ach": "ach_Latn",
    "teo": "teo_Latn",
    "lgg": "lgg_Latn",
    "fra": "fra_Latn",
    "yor": "yor_Latn",
    "ibo": "ibo_Latn",
    "hau": "hau_Latn",
    "zul": "zul_Latn",
    "xho": "xho_Latn",
    "kin": "kin_Latn",
    "som": "som_Latn",
    "amh": "amh_Ethi",
    "tir": "tir_Ethi",
    "lin": "lin_Latn",
    "sna": "sna_Latn",
    "tsn": "tsn_Latn",
    "sot": "sot_Latn",
    "nya": "nya_Latn",
    "wol": "wol_Latn",
    "aka": "aka_Latn",
    "ewe": "ewe_Latn",
}
