# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for OmniVoice GGUF zero-shot voice cloning engine and component.
"""

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from lingualdub.components.tts.omnivoice import OmniVoiceTTSComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.result import Result, ResultStatus
from lingualdub.core.segment import Segment
from lingualdub.engines.base import EngineStatus, EngineType
from lingualdub.engines.probe import HardwareCapabilities
from lingualdub.engines.quantized.omnivoice_gguf import OmniVoiceGGUFEngine


def test_omnivoice_engine_info_and_quant_selection():
    cpu_caps = HardwareCapabilities(
        accelerator="cpu",
        vram_mb=0,
        system_ram_mb=8192,
        compute_class="cpu",
        device_name="CPU",
    )
    engine_cpu = OmniVoiceGGUFEngine(capabilities=cpu_caps)
    info_cpu = engine_cpu.get_info()
    assert info_cpu.name == "omnivoice_gguf"
    assert info_cpu.engine_type == EngineType.QUANTIZED_LOCAL
    assert info_cpu.memory_footprint_mb == 659
    assert engine_cpu.quant == "Q4_K_M"
    assert "lug" in info_cpu.supported_languages

    gpu_caps = HardwareCapabilities(
        accelerator="cuda",
        vram_mb=16384,
        system_ram_mb=32768,
        compute_class="high-vram",
        device_name="RTX 4090",
    )
    engine_gpu = OmniVoiceGGUFEngine(capabilities=gpu_caps)
    assert engine_gpu.quant == "BF16"
    assert engine_gpu.get_info().memory_footprint_mb == 1600


def test_omnivoice_engine_shutdown():
    engine = OmniVoiceGGUFEngine()
    engine._status = EngineStatus.READY
    engine.shutdown()
    assert engine.status == EngineStatus.STOPPED


def test_omnivoice_component_contract():
    comp = OmniVoiceTTSComponent(language="lug")
    assert comp.name == "omnivoice_gguf"
    assert comp.task == ComponentTask.TTS
    assert comp.on_failure == FailureMode.DEGRADE
    assert "lug" in comp.supported_languages
    assert "yor" in comp.supported_languages
    assert comp.requires == ["translation"]
    assert comp.provides == ["synthesised_audio"]


def test_omnivoice_component_rejects_non_result():
    comp = OmniVoiceTTSComponent()
    with pytest.raises(ValueError, match="expects a Result input"):
        comp.run("not a result")  # type: ignore[arg-type]


def test_omnivoice_component_enforces_consent():
    comp = OmniVoiceTTSComponent()
    res = Result(
        segments=[Segment(start=0.0, end=2.0, text="Oli otya", language="lug", speaker="spk_1")],
        source_language="lug",
        provenance={},
    )
    with pytest.raises(ValueError, match="consent_basis"):
        comp.run(res)


def test_omnivoice_component_empty_segments():
    comp = OmniVoiceTTSComponent()
    inp = Result(
        segments=[],
        source_language="lug",
        target_language="lug",
        provenance={"consent_basis": "explicit_user_opt_in"},
    )
    out = comp.run(inp)
    assert len(out.segments) == 0


def test_omnivoice_component_run_success(tmp_path):
    mock_engine = MagicMock(spec=OmniVoiceGGUFEngine)
    mock_engine.quant = "Q4_K_M"

    def fake_synthesize(text, output_wav, ref_audio_path=None, language="lug", speed=1.0):
        dest = Path(output_wav)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(b"RIFFomnivoicewavdata")
        return dest

    mock_engine.synthesize.side_effect = fake_synthesize

    comp = OmniVoiceTTSComponent(
        language="lug",
        output_dir=str(tmp_path),
        engine=mock_engine,
    )

    inp = Result(
        segments=[
            Segment(
                start=0.0,
                end=2.0,
                text="Twebaza nnyo omwagalwa",
                language="lug",
                metadata={
                    "duration_ratio": 1.0,
                    "target_duration": 2.0,
                    "reference_audio": "/tmp/ref_voice.wav",
                },
            )
        ],
        source_language="lug",
        target_language="lug",
        provenance={"consent_basis": "explicit_user_opt_in"},
    )

    out = comp.run(inp)

    assert len(out.segments) == 1
    assert len(out.artifacts) == 1
    wav_file = Path(out.artifacts[0])
    assert wav_file.exists()
    assert wav_file.read_bytes() == b"RIFFomnivoicewavdata"
    assert out.segments[0].metadata["fitting_strategy"] == "compress"
    assert out.metadata["quant"] == "Q4_K_M"
    mock_engine.synthesize.assert_called_once_with(
        text="Twebaza nnyo omwagalwa",
        output_wav=wav_file,
        ref_audio_path="/tmp/ref_voice.wav",
        language="lug",
        speed=1.0,
    )


def test_omnivoice_component_skip_strategy(tmp_path):
    mock_engine = MagicMock(spec=OmniVoiceGGUFEngine)
    mock_engine.quant = "Q4_K_M"

    comp = OmniVoiceTTSComponent(
        language="lug",
        output_dir=str(tmp_path),
        engine=mock_engine,
    )

    inp = Result(
        segments=[
            Segment(
                start=0.0,
                end=1.0,
                text="Ebigambo bino biwanvu nnyo ddala okusinga ekiseera ekyabaweereddwa ddala",
                language="lug",
                metadata={"duration_ratio": 2.5},
            )
        ],
        source_language="lug",
        target_language="lug",
        provenance={"consent_basis": "explicit_user_opt_in"},
    )

    out = comp.run(inp)
    assert len(out.segments) == 1
    assert out.segments[0].metadata["unfit"] is True
    assert len(out.artifacts) == 0
    assert len(out.warnings) == 1
    mock_engine.synthesize.assert_not_called()


def test_omnivoice_component_degrade(tmp_path):
    comp = OmniVoiceTTSComponent(output_dir=str(tmp_path))
    inp = Result(
        segments=[],
        source_language="lug",
        target_language="lug",
        provenance={},
    )
    degraded = comp.degrade(inp)
    assert degraded.status == ResultStatus.DEGRADED
    assert len(degraded.artifacts) >= 1
    assert Path(degraded.artifacts[0]).exists()
    assert any("OmniVoiceTTSComponent" in w for w in degraded.warnings)
