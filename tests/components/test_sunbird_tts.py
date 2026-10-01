# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Unit tests for SunbirdTTSComponent.
"""

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from lingualdub.components.tts.sunbird import SunbirdTTSComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.result import Result, ResultStatus
from lingualdub.core.segment import Segment
from lingualdub.engines.sunbird.client import SunbirdClient


def test_sunbird_tts_contract():
    comp = SunbirdTTSComponent(api_key="sb-key")
    assert comp.name == "sunbird_tts"
    assert comp.task == ComponentTask.TTS
    assert comp.on_failure == FailureMode.DEGRADE
    assert "lug" in comp.supported_languages
    assert comp.requires == ["translation"]
    assert comp.provides == ["synthesised_audio"]


def test_sunbird_tts_rejects_non_result():
    comp = SunbirdTTSComponent(api_key="sb-key")
    with pytest.raises(ValueError, match="expects a Result input"):
        comp.run("not a result")  # type: ignore[arg-type]


def test_sunbird_tts_enforces_consent():
    comp = SunbirdTTSComponent(api_key="sb-key")
    # Result with speaker indicates voice signal, triggering consent enforcement
    res = Result(
        segments=[Segment(start=0.0, end=2.0, text="Oli otya", language="lug", speaker="spk_1")],
        source_language="lug",
        provenance={},
    )
    with pytest.raises(ValueError, match="consent_basis"):
        comp.run(res)


def test_sunbird_tts_unconfigured_client_raises():
    comp = SunbirdTTSComponent(api_key=None, client=SunbirdClient(api_key=None))
    res = Result(
        segments=[Segment(start=0.0, end=2.0, text="Oli otya", language="lug")],
        source_language="lug",
        provenance={"consent_basis": "explicit_user_opt_in"},
    )
    with pytest.raises(ValueError, match="requires an API key"):
        comp.run(res)


def test_sunbird_tts_empty_segments():
    comp = SunbirdTTSComponent(api_key="sb-key")
    res = Result(
        segments=[],
        source_language="lug",
        target_language="lug",
        provenance={"consent_basis": "explicit_user_opt_in"},
    )
    out = comp.run(res)
    assert len(out.segments) == 0


def test_sunbird_tts_synthesis_success(tmp_path):
    mock_client = MagicMock(spec=SunbirdClient)
    mock_client.is_configured = True
    mock_client.synthesize_speech.return_value = b"RIFFtestwavbytes"

    comp = SunbirdTTSComponent(
        api_key="sb-key",
        language="lug",
        output_dir=str(tmp_path),
        client=mock_client,
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
    artifact_path = Path(out.artifacts[0])
    assert artifact_path.exists()
    assert artifact_path.read_bytes() == b"RIFFtestwavbytes"
    assert out.segments[0].metadata["fitting_strategy"] == "compress"
    assert out.metadata["tts_provider"] == "sunbird_api"
    mock_client.synthesize_speech.assert_called_once_with(
        text="Twebaza nnyo",
        language="lug",
        voice_id=None,
    )


def test_sunbird_tts_skip_unfit_strategy(tmp_path):
    mock_client = MagicMock(spec=SunbirdClient)
    mock_client.is_configured = True

    comp = SunbirdTTSComponent(
        api_key="sb-key",
        language="lug",
        output_dir=str(tmp_path),
        client=mock_client,
    )

    # Large duration_ratio (e.g. 2.0 > 1.75) causes choose_strategy to return SKIP
    inp = Result(
        segments=[
            Segment(
                start=0.0,
                end=1.0,
                text="Ebigambo bino biwanvu nnyo ddala okusinga ekiseera ekyabaweereddwa",
                language="lug",
                metadata={"duration_ratio": 2.2},
            )
        ],
        source_language="lug",
        target_language="lug",
        provenance={"consent_basis": "explicit_user_opt_in"},
    )

    out = comp.run(inp)

    # Segment was skipped from audio synthesis
    assert len(out.segments) == 1
    assert out.segments[0].metadata["unfit"] is True
    assert len(out.artifacts) == 0
    assert len(out.warnings) == 1
    assert "skipped" in out.warnings[0]
    mock_client.synthesize_speech.assert_not_called()


def test_sunbird_tts_degrade_path(tmp_path):
    comp = SunbirdTTSComponent(output_dir=str(tmp_path))
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
    assert any("SunbirdTTSComponent" in w for w in degraded.warnings)
