# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Base engine contracts and execution lifecycle.

Engines represent the underlying execution runtimes that perform speech and
language AI tasks — either via cloud APIs (e.g. Sunbird AI) or local quantized
runtimes (GGUF, CTranslate2, ONNX).
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Protocol, runtime_checkable

from lingualdub.types import MetadataDict


class EngineType(str, Enum):
    """Categorization of engine execution location and style."""

    CLOUD_API = "cloud_api"
    QUANTIZED_LOCAL = "quantized_local"
    NEURAL_LOCAL = "neural_local"
    DSP_LOCAL = "dsp_local"


class EngineStatus(str, Enum):
    """Operational health status of an engine."""

    UNINITIALIZED = "uninitialized"
    READY = "ready"
    BUSY = "busy"
    DEGRADED = "degraded"
    ERROR = "error"
    STOPPED = "stopped"


@dataclass(frozen=True)
class EngineInfo:
    """Metadata describing an engine capability and operational footprint."""

    name: str
    version: str
    engine_type: EngineType
    supported_tasks: list[str]
    supported_languages: list[str]
    memory_footprint_mb: int = 0
    requires_gpu: bool = False
    requires_network: bool = False
    metadata: MetadataDict = field(default_factory=dict)


@runtime_checkable
class EngineProtocol(Protocol):
    """Structural protocol for all LingualDub engines."""

    name: str
    engine_type: EngineType
    status: EngineStatus

    def is_available(self) -> bool:
        """Return True if required dependencies or network endpoints are reachable."""
        ...

    def initialize(self) -> None:
        """Warm up model weights, allocate memory, or verify API connectivity."""
        ...

    def shutdown(self) -> None:
        """Release GPU memory, close open network sessions, or stop workers."""
        ...


class BaseEngine(ABC):
    """Abstract base class for all execution engines in LingualDub."""

    name: str
    version: str = "1.0.0"
    engine_type: EngineType = EngineType.NEURAL_LOCAL

    def __init__(self) -> None:
        self._status: EngineStatus = EngineStatus.UNINITIALIZED
        self._error_message: str | None = None

    @property
    def status(self) -> EngineStatus:
        """Current operational status."""
        return self._status

    @property
    def error_message(self) -> str | None:
        """Error details if status is ERROR or DEGRADED."""
        return self._error_message

    def is_available(self) -> bool:
        """Default availability check; subclasses should override with runtime probes."""
        return True

    def initialize(self) -> None:
        """Initialize the engine."""
        self._status = EngineStatus.READY

    def shutdown(self) -> None:
        """Teardown and free resources."""
        self._status = EngineStatus.STOPPED

    @abstractmethod
    def get_info(self) -> EngineInfo:
        """Return structured capability metadata."""
        ...

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name={self.name!r}, status={self._status.value!r})"
