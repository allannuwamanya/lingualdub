# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
OmniVoice GGUF zero-shot voice cloning engine.

Enables zero-shot voice cloning and speech synthesis across 646 languages
including African low-resource languages (Luganda, Runyankole, Swahili, etc.)
with quantized GGUF models running in 659MB–945MB RAM on consumer CPUs or GPUs.
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
from pathlib import Path
from typing import Any, cast

from lingualdub.engines.base import BaseEngine, EngineInfo, EngineStatus, EngineType
from lingualdub.engines.probe import HardwareCapabilities, detect_capabilities

logger = logging.getLogger(__name__)

# Quantization tier mapping based on host compute capability
QUANT_TIERS = {
    "high-vram": {"quant": "BF16", "memory_mb": 1600},
    "mid-vram": {"quant": "Q8_0", "memory_mb": 945},
    "low-vram": {"quant": "Q4_K_M", "memory_mb": 659},
    "cpu": {"quant": "Q4_K_M", "memory_mb": 659},
}


class OmniVoiceGGUFEngine(BaseEngine):
    """
    GGUF execution engine for OmniVoice zero-shot multilingual speech synthesis.
    """

    name = "omnivoice_gguf"
    version = "1.0.0"
    engine_type = EngineType.QUANTIZED_LOCAL

    def __init__(
        self,
        binary_path: str | Path | None = None,
        model_dir: str | Path | None = None,
        quant_override: str | None = None,
        device: str | None = None,
        capabilities: HardwareCapabilities | None = None,
    ) -> None:
        super().__init__()
        self.caps = capabilities or detect_capabilities()
        self.quant = quant_override or self.caps.recommended_gguf_quant
        self.device = device or ("cuda" if self.caps.accelerator == "cuda" else "cpu")
        self.model_dir = (
            Path(model_dir) if model_dir else Path.home() / ".cache" / "lingualdub" / "omnivoice"
        )
        self.binary_path = Path(binary_path) if binary_path else self._find_binary()
        self._runner: Any = None

    def _find_binary(self) -> Path | None:
        """Locate omnivoice-tts executable in PATH or standard install dirs."""
        # 1. Environment variable
        env_path = os.environ.get("OMNIVOICE_BIN")
        if env_path and os.path.exists(env_path):
            return Path(env_path)

        # 2. In PATH
        which_path = shutil.which("omnivoice-tts")
        if which_path:
            return Path(which_path)

        # 3. In cache or repo bin
        local_bin = self.model_dir / "bin" / "omnivoice-tts"
        if local_bin.exists():
            return local_bin

        return None

    def is_available(self) -> bool:
        """Check if native binary or python bindings are present."""
        if self.binary_path and self.binary_path.exists():
            return True
        try:
            import omnivoice  # noqa: F401

            return True
        except ImportError:
            return False

    def initialize(self) -> None:
        """Verify binary or python binding readiness."""
        if not self.is_available():
            self._status = EngineStatus.DEGRADED
            self._error_message = (
                "OmniVoice binary or 'omnivoice' python package not found. "
                "Set OMNIVOICE_BIN or install omnivoice."
            )
            return

        self._status = EngineStatus.READY

    def shutdown(self) -> None:
        self._runner = None
        self._status = EngineStatus.STOPPED

    def synthesize(
        self,
        text: str,
        output_wav: Path | str,
        ref_audio_path: str | Path | None = None,
        language: str = "lug",
        speed: float = 1.0,
    ) -> Path:
        """
        Synthesize speech with optional zero-shot reference voice cloning.

        Args:
            text: Text to synthesize.
            output_wav: Destination file path for generated audio.
            ref_audio_path: Optional 3-10s clean reference audio of target speaker.
            language: Language ISO code.
            speed: Speech rate multiplier.

        Returns:
            Path to synthesized audio file.
        """
        dest_path = Path(output_wav)
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        if self.binary_path and self.binary_path.exists():
            cmd = [
                str(self.binary_path),
                "--text",
                text,
                "--output",
                str(dest_path),
                "--language",
                language,
                "--speed",
                str(speed),
                "--quant",
                self.quant,
            ]
            if ref_audio_path:
                cmd.extend(["--reference-audio", str(ref_audio_path)])

            try:
                subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=60)
                return dest_path
            except Exception as exc:
                logger.error("OmniVoice binary synthesis failed: %s", exc)
                raise RuntimeError(f"OmniVoice synthesis error: {exc}") from exc

        # Python binding fallback
        try:
            import omnivoice

            synthesizer = getattr(self, "_runner", None)
            if synthesizer is None:
                synthesizer = omnivoice.load_synthesizer(str(self.model_dir), quant=self.quant)
                self._runner = synthesizer

            synthesizer.generate_to_file(
                text=text,
                output_path=str(dest_path),
                ref_audio=str(ref_audio_path) if ref_audio_path else None,
                language=language,
                speed=speed,
            )
            return dest_path
        except ImportError as exc:
            raise RuntimeError(
                "Neither OmniVoice binary nor 'omnivoice' python module is available."
            ) from exc

    def get_info(self) -> EngineInfo:
        tier_info = QUANT_TIERS.get(self.caps.compute_class, QUANT_TIERS["cpu"])
        return EngineInfo(
            name=self.name,
            version=self.version,
            engine_type=self.engine_type,
            supported_tasks=["tts", "voice_cloning"],
            supported_languages=[
                "lug",
                "nyn",
                "swa",
                "eng",
                "ach",
                "teo",
                "lgg",
                "yor",
                "ibo",
                "hau",
                "zul",
                "xho",
                "kin",
                "som",
                "amh",
                "lin",
                "sna",
                "tsn",
                "sot",
                "nya",
                "wol",
                "aka",
                "ewe",
            ],
            memory_footprint_mb=cast(int, tier_info["memory_mb"]),
            requires_gpu=False,
            requires_network=False,
            metadata={
                "quant": self.quant,
                "compute_class": self.caps.compute_class,
                "accelerator": self.caps.accelerator,
                "binary_path": str(self.binary_path) if self.binary_path else None,
            },
        )
