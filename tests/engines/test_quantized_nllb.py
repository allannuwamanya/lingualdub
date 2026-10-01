# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for CTranslate2 INT8 NLLB-200 translation engine and component.
"""

from unittest.mock import MagicMock

import pytest

from lingualdub.components.translation.quantized_nllb import (
    QuantizedNLLBTranslationComponent,
)
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment
from lingualdub.engines.base import EngineStatus, EngineType
from lingualdub.engines.quantized.nllb_ct2 import CTranslate2NLLBEngine


def test_ct2_nllb_engine_info():
    engine = CTranslate2NLLBEngine(compute_type="int8", device="cpu")
    info = engine.get_info()
    assert info.name == "ctranslate2_nllb"
    assert info.engine_type == EngineType.QUANTIZED_LOCAL
    assert info.memory_footprint_mb == 600
    assert info.requires_gpu is False
    assert "lug" in info.supported_languages
    assert "yor" in info.supported_languages
    assert info.metadata["compute_type"] == "int8"


def test_ct2_nllb_engine_shutdown():
    engine = CTranslate2NLLBEngine()
    engine._status = EngineStatus.READY
    engine.shutdown()
    assert engine.status == EngineStatus.STOPPED
    assert engine._translator is None
    assert engine._tokenizer is None


def test_ct2_nllb_translate_batch_mock():
    engine = CTranslate2NLLBEngine()

    mock_translator = MagicMock()
    mock_tokenizer = MagicMock()

    # Mock tokenization
    mock_tokenizer.encode.return_value = [100, 200]
    mock_tokenizer.convert_ids_to_tokens.return_value = [" Oli", " otya"]
    mock_tokenizer.convert_tokens_to_ids.return_value = [300, 400]
    mock_tokenizer.decode.return_value = "Hello madam"

    # Mock CTranslate2 hypothesis
    mock_hyp = MagicMock()
    mock_hyp.hypotheses = [["eng_Latn", " Hello", " madam"]]
    mock_translator.translate_batch.return_value = [mock_hyp]

    engine._translator = mock_translator
    engine._tokenizer = mock_tokenizer
    engine._status = EngineStatus.READY

    res = engine.translate_batch(
        texts=["Oli otya"],
        source_language="lug",
        target_language="eng",
    )
    assert res == ["Hello madam"]
    mock_translator.translate_batch.assert_called_once()


def test_quantized_nllb_component_contract():
    comp = QuantizedNLLBTranslationComponent(source_language="lug", target_language="eng")
    assert comp.name == "quantized_nllb"
    assert comp.task == ComponentTask.TRANSLATION
    assert comp.on_failure == FailureMode.ABORT
    assert "lug" in comp.supported_languages
    assert "yor" in comp.supported_languages
    assert comp.requires == ["transcription"]
    assert comp.provides == ["translation"]


def test_quantized_nllb_component_rejects_non_result():
    comp = QuantizedNLLBTranslationComponent()
    with pytest.raises(ValueError, match="expects a Result input"):
        comp.run("not a result")  # type: ignore[arg-type]


def test_quantized_nllb_component_empty_segments():
    comp = QuantizedNLLBTranslationComponent(source_language="lug", target_language="eng")
    inp = Result(segments=[], source_language="lug")
    out = comp.run(inp)
    assert len(out.segments) == 0
    assert out.target_language == "eng"


def test_quantized_nllb_component_run_with_mock_engine():
    mock_engine = MagicMock(spec=CTranslate2NLLBEngine)
    mock_engine.compute_type = "int8"
    mock_engine.translate_batch.return_value = ["Good morning madam"]

    comp = QuantizedNLLBTranslationComponent(
        source_language="lug",
        target_language="eng",
        engine=mock_engine,
    )

    inp = Result(
        segments=[
            Segment(
                start=0.0,
                end=2.0,
                text="Wasuze otya nnyabo",
                language="lug",
                speaker="spk_0",
                confidence=0.95,
            )
        ],
        source_language="lug",
    )

    out = comp.run(inp)

    assert len(out.segments) == 1
    seg = out.segments[0]
    assert seg.text == "Good morning madam"
    assert seg.language == "eng"
    assert seg.source_language == "lug"
    assert seg.speaker == "spk_0"
    assert seg.confidence == 0.95
    assert out.metadata["compute_type"] == "int8"
    mock_engine.translate_batch.assert_called_once_with(
        texts=["Wasuze otya nnyabo"],
        source_language="lug",
        target_language="eng",
    )
