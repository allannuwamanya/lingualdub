# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
CTranslate2 INT8 quantized NLLB-200 translation engine and component.

Enables ultra-fast, low-memory translation across 50+ African languages
(Luganda, Runyankole, Swahili, Yoruba, Igbo, Hausa, Amharic, etc.)
running in ~600MB RAM on standard multi-core CPUs (~50ms per sentence).
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from lingualdub.engines.base import BaseEngine, EngineInfo, EngineStatus, EngineType
from lingualdub.languages.nllb import NLLB_CODE_MAP

logger = logging.getLogger(__name__)

DEFAULT_CT2_NLLB_MODEL = "ctranslate2-nllb-200-distilled-600M"


class CTranslate2NLLBEngine(BaseEngine):
    """
    CTranslate2 execution engine for quantized NLLB models.
    """

    name = "ctranslate2_nllb"
    version = "1.0.0"
    engine_type = EngineType.QUANTIZED_LOCAL

    def __init__(
        self,
        model_path: str | Path | None = None,
        device: str = "cpu",
        compute_type: str = "int8",
        inter_threads: int = 1,
        intra_threads: int = 4,
    ) -> None:
        if not model_path:
            try:
                from lingualdub.models.manager import ModelManager

                cached_path = ModelManager().get_model_path("ct2_nllb")
                self.model_path = str(cached_path) if cached_path else DEFAULT_CT2_NLLB_MODEL
            except Exception:
                self.model_path = DEFAULT_CT2_NLLB_MODEL
        else:
            self.model_path = str(model_path)
        self.device = device
        self.compute_type = compute_type
        self.inter_threads = inter_threads
        self.intra_threads = intra_threads
        self._translator: Any = None
        self._tokenizer: Any = None

    def is_available(self) -> bool:
        """Check if ctranslate2 is installed and model path exists or is loadable."""
        try:
            import ctranslate2  # noqa: F401
            return True
        except ImportError:
            return False

    def initialize(self) -> None:
        """Load CTranslate2 Translator and Tokenizer."""
        if self._translator is None:
            try:
                import ctranslate2
                from transformers import AutoTokenizer
            except ImportError as exc:
                self._status = EngineStatus.ERROR
                self._error_message = str(exc)
                raise RuntimeError(
                    "CTranslate2NLLBEngine requires 'ctranslate2' and 'transformers'. "
                    "Install with: pip install ctranslate2 transformers"
                ) from exc

            logger.info(
                "Loading CTranslate2 NLLB model from %s (%s on %s)",
                self.model_path,
                self.compute_type,
                self.device,
            )
            self._translator = ctranslate2.Translator(
                self.model_path,
                device=self.device,
                compute_type=self.compute_type,
                inter_threads=self.inter_threads,
                intra_threads=self.intra_threads,
            )
            self._tokenizer = AutoTokenizer.from_pretrained(
                "facebook/nllb-200-distilled-600M"
            )
            self._status = EngineStatus.READY

    def shutdown(self) -> None:
        self._translator = None
        self._tokenizer = None
        self._status = EngineStatus.STOPPED

    def translate_batch(
        self,
        texts: list[str],
        source_language: str,
        target_language: str,
        max_batch_size: int = 32,
    ) -> list[str]:
        """
        Translate a batch of texts using CTranslate2 INT8 model.
        """
        if not texts:
            return []

        if self._translator is None:
            self.initialize()

        src_code = NLLB_CODE_MAP.get(source_language, source_language)
        tgt_code = NLLB_CODE_MAP.get(target_language, target_language)

        if hasattr(self._tokenizer, "src_lang"):
            self._tokenizer.src_lang = src_code

        # Tokenize subwords
        tokenized = [
            self._tokenizer.convert_ids_to_tokens(self._tokenizer.encode(t))
            for t in texts
        ]

        target_prefix = [[tgt_code]] * len(tokenized)

        results = self._translator.translate_batch(
            tokenized,
            target_prefix=target_prefix,
            max_batch_size=max_batch_size,
        )

        translations: list[str] = []
        for res in results:
            target_tokens = res.hypotheses[0]
            # Strip target language prefix token if present
            if target_tokens and target_tokens[0] == tgt_code:
                target_tokens = target_tokens[1:]
            token_ids = self._tokenizer.convert_tokens_to_ids(target_tokens)
            text = self._tokenizer.decode(token_ids, skip_special_tokens=True).strip()
            translations.append(text)

        return translations

    def get_info(self) -> EngineInfo:
        return EngineInfo(
            name=self.name,
            version=self.version,
            engine_type=self.engine_type,
            supported_tasks=["translation"],
            supported_languages=list(NLLB_CODE_MAP.keys()),
            memory_footprint_mb=600,
            requires_gpu=False,
            requires_network=False,
            metadata={
                "compute_type": self.compute_type,
                "device": self.device,
                "model_path": self.model_path,
            },
        )
