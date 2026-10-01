# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Hardware capabilities probe for LingualDub engines.

Auto-detects host accelerators (CUDA, Apple Silicon MPS, ROCm, CPU) and available
memory to determine optimal model quantization tiers (e.g. GGUF Q4_K_M vs Q8_0 vs FP16).
Runs cheaply without loading heavy models or triggering CUDA kernel compilations.
"""

from __future__ import annotations

import logging
import os
import sys
from dataclasses import dataclass
from typing import Literal

logger = logging.getLogger(__name__)

ComputeClass = Literal["cpu", "low-vram", "mid-vram", "high-vram"]
AcceleratorType = Literal["cuda", "mps", "rocm", "cpu"]


@dataclass(frozen=True)
class HardwareCapabilities:
    """Snapshot of host accelerator and memory capacity."""

    accelerator: AcceleratorType
    vram_mb: int
    system_ram_mb: int
    compute_class: ComputeClass
    device_name: str

    @property
    def can_run_local_heavy(self) -> bool:
        """Return True if host can run heavy FP16/BF16 models (>12GB VRAM)."""
        return self.compute_class == "high-vram"

    @property
    def recommended_gguf_quant(self) -> str:
        """Recommend optimal GGUF quantization level for zero-shot voice cloning."""
        if self.compute_class == "high-vram":
            return "BF16"
        elif self.compute_class == "mid-vram":
            return "Q8_0"
        else:
            return "Q4_K_M"


def _bucket_vram(vram_mb: int) -> ComputeClass:
    """
    Bucket VRAM in MB into standard compute tiers.

    Thresholds:
        >= 12,000 MB: high-vram (BF16 / full neural)
        >=  4,000 MB: mid-vram (Q8_0 quantization)
        >=  1,000 MB: low-vram (Q4_K_M quantization)
        <   1,000 MB: cpu (Q4_K_M CPU or ONNX INT8)
    """
    if vram_mb >= 12000:
        return "high-vram"
    elif vram_mb >= 4000:
        return "mid-vram"
    elif vram_mb >= 1000:
        return "low-vram"
    return "cpu"


def _get_system_ram_mb() -> int:
    """Get total system RAM in MB without hard dependencies."""
    try:
        import psutil

        return int(psutil.virtual_memory().total / (1024 * 1024))
    except ImportError:
        pass

    # Linux fallback via /proc/meminfo
    if sys.platform.startswith("linux") and os.path.exists("/proc/meminfo"):
        try:
            with open("/proc/meminfo", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("MemTotal:"):
                        kb = int(line.split()[1])
                        return int(kb / 1024)
        except Exception:
            pass

    # Default fallback assumption
    return 8192


def detect_capabilities() -> HardwareCapabilities:
    """
    Probe the host environment for available accelerators and memory capacity.

    Non-blocking, fast probe safe for application startup.
    """
    sys_ram = _get_system_ram_mb()

    # 1. Check CUDA / ROCm
    try:
        import torch

        if torch.cuda.is_available():
            try:
                device_idx = torch.cuda.current_device()
                device_name = torch.cuda.get_device_name(device_idx)
                # Check for ROCm vs CUDA
                is_rocm = getattr(torch.version, "hip", None) is not None
                accelerator: AcceleratorType = "rocm" if is_rocm else "cuda"

                # Driver-level mem info in bytes
                free_b, total_b = torch.cuda.mem_get_info(device_idx)
                vram_mb = int(total_b / (1024 * 1024))
                compute_class = _bucket_vram(vram_mb)

                return HardwareCapabilities(
                    accelerator=accelerator,
                    vram_mb=vram_mb,
                    system_ram_mb=sys_ram,
                    compute_class=compute_class,
                    device_name=device_name,
                )
            except Exception as exc:
                logger.debug("CUDA memory query failed: %s", exc)

        # 2. Check Apple Silicon MPS
        if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            # In unified memory architecture, treat half of system RAM as effective VRAM
            vram_mb = int(sys_ram / 2)
            compute_class = _bucket_vram(vram_mb)
            return HardwareCapabilities(
                accelerator="mps",
                vram_mb=vram_mb,
                system_ram_mb=sys_ram,
                compute_class=compute_class,
                device_name="Apple Silicon (Unified Memory)",
            )
    except ImportError:
        pass

    # 3. CPU fallback
    compute_class = "cpu"
    return HardwareCapabilities(
        accelerator="cpu",
        vram_mb=0,
        system_ram_mb=sys_ram,
        compute_class=compute_class,
        device_name="CPU",
    )
