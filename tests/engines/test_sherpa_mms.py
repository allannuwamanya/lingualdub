# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for Sherpa-ONNX MMS-TTS engine and component.
"""

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from lingualdub.components.tts.sherpa_mms import SherpaMMSTTSComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.result import Result, ResultStatus
from lingualdub.core.segment import Segment
from lingualdub.engines.base import EngineStatus, EngineType
from lingualdub.engines.quantized.sherpa_mms import SherpaMMSEngine


def test_sherpa_mms_engine_info():
    engine = SherpaMMSEngine(model_path="/path/to/model.onnx")
    info = engine.get_info()
    assert info.name == "sherpa_mms"
    assert info.engine_type == EngineType.QUANTIZED_LOCAL
    assert info.memory_footprint_mb == 35
    assert info.requires_gpu is False
    assert "lug" in info.supported_languages
    assert "yor" in info.supported_languages
    assert info.metadata["runtime"] == "sherpa_onnx"


def test_sherpa_mms_engine_shutdown():
    engine = SherpaMMSEngine()
    engine._status = EngineStatus.READY
    engine.shutdown()
    assert engine.status == EngineStatus.STOPPED
    assert engine._tts is None


def test_sherpa_mms_engine_synthesize_mock():
    engine = SherpaMMSEngine()
    mock_tts = MagicMock()
    mock_audio = MagicMock()
    mock_audio.sample_rate = 16000
    mock_audio.samples = [0.0, 0.1, -0.1]
    mock_tts.generate.return_value = mock_audio

    engine._tts = mock_tts
    engine._status = EngineStatus.READY

    sr, samples = engine.synthesize("Oli otya", speed=1.1)
    assert sr == 16000
    assert samples == [0.0, 0.1, -0.1]
    mock_tts.generate.assert_called_once_with("Oli otya", sid=0, speed=1.1)


def test_sherpa_mms_component_contract():
    comp = SherpaMMSTTSComponent(language="lug")
    assert comp.name == "sherpa_mms_tts"
    assert comp.task == ComponentTask.TTS
    assert comp.on_failure == FailureMode.DEGRADE
    assert "lug" in comp.supported_languages
    assert "yor" in comp.supported_languages
    assert comp.requires == ["translation"]
    assert comp.provides == ["synthesised_audio"]


def test_sherpa_mms_component_rejects_non_result():
    comp = SherpaMMSTTSComponent()
    with pytest.raises(ValueError, match="expects a Result input"):
        comp.run("not a result")  # type: ignore[arg-type]


def test_sherpa_mms_component_enforces_consent():
    comp = SherpaMMSTTSComponent()
    res = Result(
        segments=[Segment(start=0.0, end=2.0, text="Oli otya", language="lug", speaker="spk_1")],
        source_language="lug",
        provenance={},
    )
    with pytest.raises(ValueError, match="consent_basis"):
        comp.run(res)


def test_sherpa_mms_component_empty_segments():
    comp = SherpaMMSTTSComponent()
    inp = Result(
        segments=[],
        source_language="lug",
        target_language="lug",
        provenance={"consent_basis": "explicit_user_opt_in"},
    )
    out = comp.run(inp)
    assert len(out.segments) == 0


def test_sherpa_mms_component_run_success(tmp_path):
    mock_engine = MagicMock(spec=SherpaMMSEngine)
    mock_engine.synthesize.return_value = (16000, [0.0, 0.2, -0.2])

    comp = SherpaMMSTTSComponent(
        language="lug",
        output_dir=str(tmp_path),
        engine=mock_engine,
    )

    inp = Result(
        segments=[
            Segment(
                start=0.0,
                end=2.0,
                text="Twebaza nnyo",
                language="lug",
                metadata={"duration_ratio": 1.0, "target_duration": 2.0},
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
    assert out.segments[0].metadata["fitting_strategy"] == "compress"
    assert out.metadata["tts_runtime"] == "sherpa_onnx"
    mock_engine.synthesize.assert_called_once()


def test_sherpa_mms_component_skip_strategy(tmp_path):
    mock_engine = MagicMock(spec=SherpaMMSEngine)

    comp = SherpaMMSTTSComponent(
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


def test_sherpa_mms_component_degrade(tmp_path):
    comp = SherpaMMSTTSComponent(output_dir=str(tmp_path))
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
    assert any("SherpaMMSTTSComponent" in w for w in degraded.warnings)


def test_sherpa_mms_auto_resolve_cached(tmp_path: Path):
    from unittest.mock import patch

    with patch(
        "lingualdub.models.manager.ModelManager.find_mms_model_for_language", return_value=tmp_path
    ):
        (tmp_path / "model.onnx").write_bytes(b"data")
        (tmp_path / "tokens.txt").write_text("a 0")
        (tmp_path / "lexicon.txt").write_text("lexicon")

        engine = SherpaMMSEngine(language="lug")
        assert engine.model_path == str(tmp_path / "model.onnx")
        assert engine.tokens_path == str(tmp_path / "tokens.txt")
        assert engine.lexicon_path == str(tmp_path / "lexicon.txt")
