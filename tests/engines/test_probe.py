# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for hardware capabilities probe and base engine abstractions.
"""

from unittest.mock import MagicMock, patch

from lingualdub.engines.base import BaseEngine, EngineInfo, EngineProtocol, EngineStatus
from lingualdub.engines.probe import (
    HardwareCapabilities,
    _bucket_vram,
    _get_system_ram_mb,
    detect_capabilities,
)


def test_bucket_vram():
    assert _bucket_vram(16000) == "high-vram"
    assert _bucket_vram(12000) == "high-vram"
    assert _bucket_vram(8000) == "mid-vram"
    assert _bucket_vram(4000) == "mid-vram"
    assert _bucket_vram(2048) == "low-vram"
    assert _bucket_vram(1000) == "low-vram"
    assert _bucket_vram(999) == "cpu"
    assert _bucket_vram(0) == "cpu"


def test_hardware_capabilities_properties():
    high = HardwareCapabilities(
        accelerator="cuda",
        vram_mb=16384,
        system_ram_mb=32768,
        compute_class="high-vram",
        device_name="NVIDIA RTX 4090",
    )
    assert high.can_run_local_heavy is True
    assert high.recommended_gguf_quant == "BF16"

    mid = HardwareCapabilities(
        accelerator="cuda",
        vram_mb=6144,
        system_ram_mb=16384,
        compute_class="mid-vram",
        device_name="NVIDIA RTX 3060",
    )
    assert mid.can_run_local_heavy is False
    assert mid.recommended_gguf_quant == "Q8_0"

    low = HardwareCapabilities(
        accelerator="cuda",
        vram_mb=2048,
        system_ram_mb=8192,
        compute_class="low-vram",
        device_name="NVIDIA GTX 1050",
    )
    assert low.can_run_local_heavy is False
    assert low.recommended_gguf_quant == "Q4_K_M"

    cpu = HardwareCapabilities(
        accelerator="cpu",
        vram_mb=0,
        system_ram_mb=8192,
        compute_class="cpu",
        device_name="CPU",
    )
    assert cpu.can_run_local_heavy is False
    assert cpu.recommended_gguf_quant == "Q4_K_M"


def test_get_system_ram_mb():
    ram = _get_system_ram_mb()
    assert isinstance(ram, int)
    assert ram > 0


def test_detect_capabilities_live():
    caps = detect_capabilities()
    assert isinstance(caps, HardwareCapabilities)
    assert caps.accelerator in ("cuda", "mps", "rocm", "cpu")
    assert caps.compute_class in ("cpu", "low-vram", "mid-vram", "high-vram")
    assert caps.system_ram_mb > 0


def test_detect_capabilities_mock_cuda():
    mock_torch = MagicMock()
    mock_torch.cuda.is_available.return_value = True
    mock_torch.cuda.current_device.return_value = 0
    mock_torch.cuda.get_device_name.return_value = "Mock NVIDIA GPU"
    mock_torch.version.hip = None
    # 8GB total VRAM (8192 * 1024 * 1024 bytes)
    mock_torch.cuda.mem_get_info.return_value = (4096 * 1024 * 1024, 8192 * 1024 * 1024)

    with patch.dict("sys.modules", {"torch": mock_torch}):
        caps = detect_capabilities()
        assert caps.accelerator == "cuda"
        assert caps.vram_mb == 8192
        assert caps.compute_class == "mid-vram"
        assert caps.device_name == "Mock NVIDIA GPU"


def test_detect_capabilities_mock_mps():
    mock_torch = MagicMock()
    mock_torch.cuda.is_available.return_value = False
    mock_torch.backends.mps.is_available.return_value = True

    with (
        patch.dict("sys.modules", {"torch": mock_torch}),
        patch("lingualdub.engines.probe._get_system_ram_mb", return_value=16384),
    ):
        caps = detect_capabilities()
        assert caps.accelerator == "mps"
        assert caps.vram_mb == 8192
        assert caps.compute_class == "mid-vram"


def test_detect_capabilities_mock_cpu_fallback():
    mock_torch = MagicMock()
    mock_torch.cuda.is_available.return_value = False
    mock_torch.backends.mps.is_available.return_value = False

    with (
        patch.dict("sys.modules", {"torch": mock_torch}),
        patch("lingualdub.engines.probe._get_system_ram_mb", return_value=8192),
    ):
        caps = detect_capabilities()
        assert caps.accelerator == "cpu"
        assert caps.vram_mb == 0
        assert caps.compute_class == "cpu"


class DummyEngine(BaseEngine):
    name = "dummy_engine"

    def get_info(self) -> EngineInfo:
        return EngineInfo(
            name=self.name,
            version=self.version,
            engine_type=self.engine_type,
            supported_tasks=["tts"],
            supported_languages=["lug"],
        )


def test_base_engine_lifecycle():
    engine = DummyEngine()
    assert isinstance(engine, EngineProtocol)
    assert engine.status == EngineStatus.UNINITIALIZED
    assert engine.is_available() is True
    assert repr(engine) == "DummyEngine(name='dummy_engine', status='uninitialized')"

    engine.initialize()
    assert engine.status == EngineStatus.READY

    info = engine.get_info()
    assert info.name == "dummy_engine"
    assert "tts" in info.supported_tasks

    engine.shutdown()
    assert engine.status == EngineStatus.STOPPED
