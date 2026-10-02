# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Meta MMS-TTS INT8 execution engine via Sherpa-ONNX.

Runs ultra-lightweight VITS ONNX models for 1,100+ African languages,
consuming only ~15–35MB of RAM per voice and synthesizing at 20x real-time on CPU.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from lingualdub.engines.base import BaseEngine, EngineInfo, EngineStatus, EngineType

logger = logging.getLogger(__name__)


class SherpaMMSEngine(BaseEngine):
    """
    Sherpa-ONNX execution engine for quantized MMS VITS speech synthesis.
    """

    name = "sherpa_mms"
    version = "1.0.0"
    engine_type = EngineType.QUANTIZED_LOCAL

    def __init__(
        self,
        model_path: str | Path | None = None,
        lexicon_path: str | Path | None = None,
        tokens_path: str | Path | None = None,
        data_dir: str | Path | None = None,
        language: str | None = None,
        num_threads: int = 2,
        sample_rate: int = 16000,
    ) -> None:
        super().__init__()
        self.language = language
        self.model_path = str(model_path) if model_path else None
        self.lexicon_path = str(lexicon_path) if lexicon_path else None
        self.tokens_path = str(tokens_path) if tokens_path else None
        self.data_dir = str(data_dir) if data_dir else None
        self.num_threads = num_threads
        self.sample_rate = sample_rate
        self._tts: Any = None

        if (not self.model_path or not self.tokens_path) and self.language:
            try:
                from lingualdub.models.manager import ModelManager

                m_dir = ModelManager().find_mms_model_for_language(self.language)
                if m_dir:
                    self.model_path = str(m_dir / "model.onnx")
                    self.tokens_path = str(m_dir / "tokens.txt")
                    if (m_dir / "lexicon.txt").is_file():
                        self.lexicon_path = str(m_dir / "lexicon.txt")
            except Exception as exc:
                logger.debug("Auto-resolving MMS model cache failed: %s", exc)

    def is_available(self) -> bool:
        """Check if sherpa_onnx runtime is installed."""
        try:
            import sherpa_onnx  # noqa: F401
            return True
        except ImportError:
            return False

    def initialize(self) -> None:
        """Initialize the Sherpa-ONNX OfflineTts engine."""
        if self._tts is None:
            try:
                import sherpa_onnx
            except ImportError as exc:
                self._status = EngineStatus.ERROR
                self._error_message = str(exc)
                raise RuntimeError(
                    "SherpaMMSEngine requires 'sherpa_onnx'. "
                    "Install with: pip install sherpa-onnx soundfile"
                ) from exc

            vits_config = sherpa_onnx.OfflineTtsVitsModelConfig(
                model=self.model_path or "",
                lexicon=self.lexicon_path or "",
                tokens=self.tokens_path or "",
                data_dir=self.data_dir or "",
            )
            model_config = sherpa_onnx.OfflineTtsModelConfig(
                vits=vits_config,
                num_threads=self.num_threads,
                debug=False,
                provider="cpu",
            )
            config = sherpa_onnx.OfflineTtsConfig(
                model=model_config,
                max_num_sentences=1,
            )

            logger.info("Initializing Sherpa-ONNX MMS-TTS from %s", self.model_path)
            self._tts = sherpa_onnx.OfflineTts(config)
            self._status = EngineStatus.READY

    def shutdown(self) -> None:
        self._tts = None
        self._status = EngineStatus.STOPPED

    def synthesize(
        self,
        text: str,
        sid: int = 0,
        speed: float = 1.0,
    ) -> tuple[int, Any]:
        """
        Synthesize text into raw waveform audio samples.

        Args:
            text: Text to synthesize.
            sid: Speaker ID (for multi-speaker models, default 0).
            speed: Speech rate multiplier.

        Returns:
            Tuple of (sample_rate, samples_array).
        """
        if self._tts is None:
            self.initialize()

        audio = self._tts.generate(text, sid=sid, speed=speed)
        return audio.sample_rate, audio.samples

    def get_info(self) -> EngineInfo:
        return EngineInfo(
            name=self.name,
            version=self.version,
            engine_type=self.engine_type,
            supported_tasks=["tts"],
            supported_languages=[
                "lug", "nyn", "swa", "eng", "ach", "teo", "lgg",
                "yor", "ibo", "hau", "zul", "xho", "kin", "som", "amh", "lin"
            ],
            memory_footprint_mb=35,
            requires_gpu=False,
            requires_network=False,
            metadata={
                "model_path": self.model_path,
                "num_threads": self.num_threads,
                "runtime": "sherpa_onnx",
            },
        )
