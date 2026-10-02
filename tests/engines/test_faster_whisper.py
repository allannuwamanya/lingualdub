# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for Faster-Whisper INT8 quantized ASR engine and component.
"""

from unittest.mock import MagicMock

import pytest

from lingualdub.components.asr.faster_whisper import FasterWhisperASRComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.resource import Resource, ResourceKind
from lingualdub.engines.base import EngineStatus, EngineType
from lingualdub.engines.quantized.whisper_ct2 import FasterWhisperEngine


def test_faster_whisper_engine_info():
    engine = FasterWhisperEngine(model_size_or_path="base", compute_type="int8")
    info = engine.get_info()
    assert info.name == "faster_whisper"
    assert info.engine_type == EngineType.QUANTIZED_LOCAL
    assert info.memory_footprint_mb == 150
    assert info.requires_gpu is False
    assert "lug" in info.supported_languages
    assert "hau" in info.supported_languages
    assert info.metadata["compute_type"] == "int8"


def test_faster_whisper_engine_shutdown():
    engine = FasterWhisperEngine()
    engine._status = EngineStatus.READY
    engine.shutdown()
    assert engine.status == EngineStatus.STOPPED
    assert engine._model is None


def test_faster_whisper_engine_transcribe_mock(tmp_path):
    audio_path = tmp_path / "test.wav"
    audio_path.write_bytes(b"RIFFdummywav")

    engine = FasterWhisperEngine()
    mock_model = MagicMock()

    mock_seg = MagicMock()
    mock_seg.start = 0.0
    mock_seg.end = 2.5
    mock_seg.text = " Oli otya nnyabo"
    mock_seg.avg_logprob = -0.15

    mock_word = MagicMock()
    mock_word.word = "Oli"
    mock_word.start = 0.0
    mock_word.end = 0.8
    mock_word.probability = 0.98
    mock_seg.words = [mock_word]

    mock_info = MagicMock()
    mock_info.language = "lug"
    mock_info.language_probability = 0.99
    mock_info.duration = 2.5

    mock_model.transcribe.return_value = ([mock_seg], mock_info)
    engine._model = mock_model
    engine._status = EngineStatus.READY

    segments, info = engine.transcribe(audio_path, language="lug")
    assert len(segments) == 1
    assert segments[0]["text"] == "Oli otya nnyabo"
    assert segments[0]["words"][0]["word"] == "Oli"
    assert info["language"] == "lug"


def test_faster_whisper_component_contract():
    comp = FasterWhisperASRComponent()
    assert comp.name == "faster_whisper_asr"
    assert comp.task == ComponentTask.ASR
    assert comp.on_failure == FailureMode.ABORT
    assert "lug" in comp.supported_languages
    assert "hau" in comp.supported_languages
    assert comp.requires == []
    assert "transcription" in comp.provides


def test_faster_whisper_component_missing_file():
    comp = FasterWhisperASRComponent()
    res = Resource(
        id="audio_res",
        kind=ResourceKind.SPEECH,
        language="lug",
        version="1.0.0",
        path="/nonexistent/audio.wav",
        provenance={"consent_basis": "user_opt_in"},
    )
    with pytest.raises(FileNotFoundError):
        comp.run(res)


def test_faster_whisper_component_enforces_consent(tmp_path):
    audio_path = tmp_path / "test.wav"
    audio_path.write_bytes(b"RIFFdummywav")

    comp = FasterWhisperASRComponent()
    res = Resource(
        id="audio_res",
        kind=ResourceKind.SPEECH,
        language="lug",
        version="1.0.0",
        path=str(audio_path),
        provenance={},  # missing consent
    )
    with pytest.raises(ValueError, match="consent_basis"):
        comp.run(res)


def test_faster_whisper_component_run_success(tmp_path):
    audio_path = tmp_path / "test.wav"
    audio_path.write_bytes(b"RIFFdummywav")

    mock_engine = MagicMock(spec=FasterWhisperEngine)
    mock_engine.model_size_or_path = "tiny"
    mock_engine.compute_type = "int8"
    mock_engine.transcribe.return_value = (
        [
            {
                "start": 0.0,
                "end": 2.0,
                "text": "Wasuze otya nnyabo",
                "confidence": 0.95,
                "words": [{"word": "Wasuze", "start": 0.0, "end": 0.8, "probability": 0.96}],
            }
        ],
        {"language": "lug", "language_probability": 0.99, "duration": 2.0},
    )

    comp = FasterWhisperASRComponent(language="lug", engine=mock_engine)
    res = Resource(
        id="audio_res",
        kind=ResourceKind.SPEECH,
        language="lug",
        version="1.0.0",
        path=str(audio_path),
        provenance={"consent_basis": "user_opt_in"},
    )

    out = comp.run(res)

    assert len(out.segments) == 1
    seg = out.segments[0]
    assert seg.text == "Wasuze otya nnyabo"
    assert seg.language == "lug"
    assert seg.confidence == 0.95
    assert seg.metadata["words"][0]["word"] == "Wasuze"
    assert out.source_language == "lug"
    assert out.metadata["compute_type"] == "int8"
    mock_engine.transcribe.assert_called_once_with(audio_path=str(audio_path), language="lug")


def test_faster_whisper_auto_resolve_cached(tmp_path):
    from unittest.mock import patch

    with patch("lingualdub.models.manager.ModelManager.get_model_path", return_value=tmp_path / "whisper_cache"):
        engine = FasterWhisperEngine(model_size_or_path="tiny")
        assert engine.model_size_or_path == str(tmp_path / "whisper_cache")
