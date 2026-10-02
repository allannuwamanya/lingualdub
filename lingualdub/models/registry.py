# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Model Registry defining real Hugging Face repositories, download metadata,
and hardware footprints for offline African speech, translation, and ASR models.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

ModelTask = Literal["tts", "translation", "asr", "voice_clone"]
ModelFamily = Literal["sherpa_mms", "ct2_nllb", "faster_whisper", "omnivoice"]


@dataclass(frozen=True)
class ModelFileSpec:
    """Specification of a single file in a model package."""

    filename: str
    required: bool = True
    expected_size_bytes: int | None = None


@dataclass
class ModelDescriptor:
    """Descriptor for a download-capable offline neural model."""

    model_id: str
    name: str
    family: ModelFamily
    task: ModelTask
    languages: list[str]
    repo_id: str
    files: list[ModelFileSpec]
    size_mb: float
    ram_mb: int
    license: str
    description: str
    tags: list[str] = field(default_factory=list)

    @property
    def primary_language(self) -> str:
        """Return the primary language code, or 'mul' for multilingual."""
        return self.languages[0] if len(self.languages) == 1 else "mul"

    def get_relative_cache_dir(self) -> Path:
        """Compute relative cache subdirectory."""
        if self.family == "sherpa_mms":
            return Path("sherpa_mms") / self.primary_language
        elif self.family == "ct2_nllb":
            return Path("ct2_nllb")
        elif self.family == "faster_whisper":
            return Path("whisper") / self.model_id.replace("whisper_", "")
        elif self.family == "omnivoice":
            return Path("omnivoice")
        return Path(self.family) / self.model_id


# Catalog of authentic offline models for African language speech AI
MODEL_CATALOG: dict[str, ModelDescriptor] = {
    # 1. Sherpa-ONNX Meta MMS-TTS (Per-Language INT8 VITS)
    "sherpa_mms_lug": ModelDescriptor(
        model_id="sherpa_mms_lug",
        name="Sherpa MMS-TTS Luganda (Ganda)",
        family="sherpa_mms",
        task="tts",
        languages=["lug"],
        repo_id="csukuangfj/vits-mms-lug-to-u",
        files=[
            ModelFileSpec("model.onnx", required=True),
            ModelFileSpec("tokens.txt", required=True),
        ],
        size_mb=35.0,
        ram_mb=35,
        license="CC-BY-NC 4.0",
        description="Offline Luganda speech synthesizer. Runs in 35MB RAM on CPU at 20x real-time.",
        tags=["tts", "luganda", "vits", "onnx", "quantized"],
    ),
    "sherpa_mms_swa": ModelDescriptor(
        model_id="sherpa_mms_swa",
        name="Sherpa MMS-TTS Swahili (Kiswahili)",
        family="sherpa_mms",
        task="tts",
        languages=["swa"],
        repo_id="csukuangfj/vits-mms-swa-to-u",
        files=[
            ModelFileSpec("model.onnx", required=True),
            ModelFileSpec("tokens.txt", required=True),
        ],
        size_mb=35.0,
        ram_mb=35,
        license="CC-BY-NC 4.0",
        description="Offline Swahili speech synthesizer for East African voice synthesis.",
        tags=["tts", "swahili", "vits", "onnx", "quantized"],
    ),
    "sherpa_mms_nyn": ModelDescriptor(
        model_id="sherpa_mms_nyn",
        name="Sherpa MMS-TTS Runyankore-Rukiga",
        family="sherpa_mms",
        task="tts",
        languages=["nyn"],
        repo_id="csukuangfj/vits-mms-nyn-to-u",
        files=[
            ModelFileSpec("model.onnx", required=True),
            ModelFileSpec("tokens.txt", required=True),
        ],
        size_mb=35.0,
        ram_mb=35,
        license="CC-BY-NC 4.0",
        description="Offline Runyankore-Rukiga speech synthesizer for Western Uganda.",
        tags=["tts", "runyankore", "vits", "onnx", "quantized"],
    ),
    "sherpa_mms_yor": ModelDescriptor(
        model_id="sherpa_mms_yor",
        name="Sherpa MMS-TTS Yoruba",
        family="sherpa_mms",
        task="tts",
        languages=["yor"],
        repo_id="csukuangfj/vits-mms-yor-to-u",
        files=[
            ModelFileSpec("model.onnx", required=True),
            ModelFileSpec("tokens.txt", required=True),
        ],
        size_mb=35.0,
        ram_mb=35,
        license="CC-BY-NC 4.0",
        description="Offline Yoruba tonal speech synthesizer with accurate diacritics.",
        tags=["tts", "yoruba", "vits", "onnx", "quantized"],
    ),
    "sherpa_mms_ibo": ModelDescriptor(
        model_id="sherpa_mms_ibo",
        name="Sherpa MMS-TTS Igbo",
        family="sherpa_mms",
        task="tts",
        languages=["ibo"],
        repo_id="csukuangfj/vits-mms-ibo-to-u",
        files=[
            ModelFileSpec("model.onnx", required=True),
            ModelFileSpec("tokens.txt", required=True),
        ],
        size_mb=35.0,
        ram_mb=35,
        license="CC-BY-NC 4.0",
        description="Offline Igbo speech synthesizer.",
        tags=["tts", "igbo", "vits", "onnx", "quantized"],
    ),
    "sherpa_mms_zul": ModelDescriptor(
        model_id="sherpa_mms_zul",
        name="Sherpa MMS-TTS isiZulu",
        family="sherpa_mms",
        task="tts",
        languages=["zul"],
        repo_id="csukuangfj/vits-mms-zul-to-u",
        files=[
            ModelFileSpec("model.onnx", required=True),
            ModelFileSpec("tokens.txt", required=True),
        ],
        size_mb=35.0,
        ram_mb=35,
        license="CC-BY-NC 4.0",
        description="Offline isiZulu speech synthesizer for Southern Africa.",
        tags=["tts", "zulu", "vits", "onnx", "quantized"],
    ),
    "sherpa_mms_hau": ModelDescriptor(
        model_id="sherpa_mms_hau",
        name="Sherpa MMS-TTS Hausa",
        family="sherpa_mms",
        task="tts",
        languages=["hau"],
        repo_id="csukuangfj/vits-mms-hau-to-u",
        files=[
            ModelFileSpec("model.onnx", required=True),
            ModelFileSpec("tokens.txt", required=True),
        ],
        size_mb=35.0,
        ram_mb=35,
        license="CC-BY-NC 4.0",
        description="Offline Hausa speech synthesizer for West and Central Africa.",
        tags=["tts", "hausa", "vits", "onnx", "quantized"],
    ),
    # 2. CTranslate2 NLLB-200 Distilled 600M INT8
    "ct2_nllb": ModelDescriptor(
        model_id="ct2_nllb",
        name="CTranslate2 NLLB-200 Distilled 600M (INT8)",
        family="ct2_nllb",
        task="translation",
        languages=[
            "lug",
            "swa",
            "nyn",
            "yor",
            "ibo",
            "hau",
            "zul",
            "xho",
            "kin",
            "som",
            "amh",
            "lin",
            "eng",
            "fra",
            "ara",
            "pt",
        ],
        repo_id="JustFrederik/nllb-200-distilled-600M-ct2-int8",
        files=[
            ModelFileSpec("model.bin", required=True),
            ModelFileSpec("shared_vocabulary.json", required=True),
            ModelFileSpec("config.json", required=True),
        ],
        size_mb=620.0,
        ram_mb=600,
        license="CC-BY-NC 4.0",
        description="INT8-quantized NLLB translation covering 50+ African languages at ~50ms/sentence.",
        tags=["translation", "nllb", "ctranslate2", "int8", "african-languages"],
    ),
    # 3. Faster-Whisper Quantized ASR
    "whisper_tiny": ModelDescriptor(
        model_id="whisper_tiny",
        name="Faster-Whisper Tiny (INT8)",
        family="faster_whisper",
        task="asr",
        languages=["mul"],
        repo_id="Systran/faster-whisper-tiny",
        files=[
            ModelFileSpec("model.bin", required=True),
            ModelFileSpec("vocabulary.txt", required=True),
            ModelFileSpec("tokenizer.json", required=True),
            ModelFileSpec("config.json", required=True),
        ],
        size_mb=75.0,
        ram_mb=120,
        license="MIT",
        description="Ultra-fast offline ASR running in ~120MB RAM for speech-to-text transcription.",
        tags=["asr", "whisper", "ctranslate2", "speech-to-text", "int8"],
    ),
    "whisper_small": ModelDescriptor(
        model_id="whisper_small",
        name="Faster-Whisper Small (INT8)",
        family="faster_whisper",
        task="asr",
        languages=["mul"],
        repo_id="Systran/faster-whisper-small",
        files=[
            ModelFileSpec("model.bin", required=True),
            ModelFileSpec("vocabulary.txt", required=True),
            ModelFileSpec("tokenizer.json", required=True),
            ModelFileSpec("config.json", required=True),
        ],
        size_mb=460.0,
        ram_mb=450,
        license="MIT",
        description="Accurate multilingual ASR model with improved speech recognition for African accents.",
        tags=["asr", "whisper", "ctranslate2", "speech-to-text", "int8"],
    ),
    # 4. OmniVoice Multilingual GGUF Zero-Shot Voice Cloning
    "omnivoice_gguf_q4": ModelDescriptor(
        model_id="omnivoice_gguf_q4",
        name="OmniVoice Zero-Shot Voice Cloning GGUF (Q4_K_M)",
        family="omnivoice",
        task="voice_clone",
        languages=["mul"],
        repo_id="lingualdub/omnivoice-gguf",
        files=[
            ModelFileSpec("omnivoice-q4_k_m.gguf", required=True),
        ],
        size_mb=659.0,
        ram_mb=659,
        license="Apache 2.0",
        description="Quantized GGUF zero-shot voice cloning engine running on consumer CPUs/GPUs.",
        tags=["voice_clone", "gguf", "zero-shot", "omnivoice", "quantized"],
    ),
}


def get_model_descriptor(model_id: str) -> ModelDescriptor | None:
    """Retrieve model descriptor by ID."""
    return MODEL_CATALOG.get(model_id)


def list_models_by_family(family: ModelFamily) -> list[ModelDescriptor]:
    """List all registered models within a family."""
    return [m for m in MODEL_CATALOG.values() if m.family == family]


def list_models_by_language(lang: str) -> list[ModelDescriptor]:
    """List models supporting a specific language code."""
    return [m for m in MODEL_CATALOG.values() if lang in m.languages or "mul" in m.languages]
