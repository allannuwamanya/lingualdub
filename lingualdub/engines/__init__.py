# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
LingualDub execution engines package.

Provides abstract engine interfaces, hardware capabilities detection, and concrete
adapters for cloud neural APIs (Sunbird AI) and local quantized runtimes (GGUF, ONNX, CTranslate2).
"""

from __future__ import annotations

from lingualdub.engines.base import (
    BaseEngine,
    EngineInfo,
    EngineProtocol,
    EngineStatus,
    EngineType,
)
from lingualdub.engines.cache import AudioContentCache, compute_cache_key
from lingualdub.engines.probe import (
    AcceleratorType,
    ComputeClass,
    HardwareCapabilities,
    detect_capabilities,
)
from lingualdub.engines.supervisor import (
    SubprocessSupervisor,
    SupervisorError,
    SupervisorTimeoutError,
    WorkerCrashedError,
)

__all__ = [
    "BaseEngine",
    "EngineInfo",
    "EngineProtocol",
    "EngineStatus",
    "EngineType",
    "HardwareCapabilities",
    "AcceleratorType",
    "ComputeClass",
    "detect_capabilities",
    "AudioContentCache",
    "compute_cache_key",
    "SubprocessSupervisor",
    "SupervisorError",
    "SupervisorTimeoutError",
    "WorkerCrashedError",
]
