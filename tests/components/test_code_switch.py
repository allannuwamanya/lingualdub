"""
Unit tests for code-switching and Language Identification (LID) components.
"""

from lingualdub.components.code_switch.dummy import DummyCodeSwitchComponent
from lingualdub.components.code_switch.heuristic import HeuristicLIDComponent
from lingualdub.core.result import Result, ResultStatus
from lingualdub.core.segment import Segment


def test_dummy_code_switch_classification():
    lid = DummyCodeSwitchComponent()
    inp = Result(
        segments=[
            Segment(start=0.0, end=1.5, text="Oli otya nnyabo", language="lug"),
            Segment(
                start=1.5, end=3.0, text="good morning can you send me the report", language="lug"
            ),
        ],
        source_language="lug",
    )
    out = lid.run(inp)

    assert len(out.segments) == 2
    assert out.segments[0].language == "lug"
    assert out.segments[1].language == "eng"
    assert "code_switch" in out.metadata
    assert out.metadata["code_switch"]["has_code_switching"] is True


def test_dummy_code_switch_split_mixed_segment():
    lid = DummyCodeSwitchComponent(split_mixed_segments=True)
    mixed_seg = Segment(
        start=0.0,
        end=3.0,
        text="Oli otya nnyabo good morning",
        language="lug",
        metadata={
            "words": [
                {"word": "Oli", "start": 0.0, "end": 0.4},
                {"word": "otya", "start": 0.4, "end": 0.8},
                {"word": "nnyabo", "start": 0.8, "end": 1.2},
                {"word": "good", "start": 1.5, "end": 2.0},
                {"word": "morning", "start": 2.0, "end": 2.8},
            ]
        },
    )
    inp = Result(segments=[mixed_seg], source_language="lug")
    out = lid.run(inp)

    assert len(out.segments) == 2
    assert out.segments[0].text == "Oli otya nnyabo"
    assert out.segments[0].language == "lug"
    assert out.segments[1].text == "good morning"
    assert out.segments[1].language == "eng"


def test_heuristic_lid_classification():
    lid = HeuristicLIDComponent(split_segments=False)
    inp = Result(
        segments=[
            Segment(
                start=0.0, end=1.5, text="Tusanyuse nnyo okulaba abaana ku ssomero", language="lug"
            ),
            Segment(
                start=1.5, end=3.5, text="Please send me the project report today", language="lug"
            ),
        ],
        source_language="lug",
    )
    out = lid.run(inp)

    assert len(out.segments) == 2
    assert out.segments[0].language == "lug"
    assert out.segments[1].language == "eng"
    assert out.segments[0].confidence is not None and out.segments[0].confidence > 0.6
    assert out.segments[1].confidence is not None and out.segments[1].confidence > 0.6


def test_code_switch_degrade_path():
    lid = DummyCodeSwitchComponent()
    inp = Result(
        segments=[
            Segment(start=0.0, end=1.0, text="hello world", language="eng"),
        ],
        source_language="lug",
    )
    degraded = lid.degrade(inp)

    assert degraded.status == ResultStatus.DEGRADED
    assert any("degraded" in w.lower() for w in degraded.warnings)


def test_audio_blender_component(tmp_path):
    from pathlib import Path

    from lingualdub.components.code_switch.blender import AudioBlendingComponent, _write_wav_samples

    # Create two dummy wav files
    wav1 = tmp_path / "seg1.wav"
    wav2 = tmp_path / "seg2.wav"
    _write_wav_samples(wav1, [0.1] * 8000, sample_rate=16000)
    _write_wav_samples(wav2, [-0.1] * 8000, sample_rate=16000)

    blender = AudioBlendingComponent(output_dir=str(tmp_path / "out"), crossfade_ms=50.0)
    inp = Result(
        segments=[
            Segment(start=0.0, end=0.5, text="Hello", language="eng"),
            Segment(start=0.5, end=1.0, text="Otya", language="lug"),
        ],
        artifacts=[str(wav1), str(wav2)],
    )

    out = blender.run(inp)
    assert out.metadata.get("audio_blended") is True
    assert len(out.artifacts) == 3
    blended_file = Path(out.artifacts[0])
    assert blended_file.exists()
    assert blended_file.stat().st_size > 0


def test_neural_lid_component_fallback():
    from lingualdub.components.code_switch.neural_lid import NeuralLIDComponent

    lid = NeuralLIDComponent(split_segments=True, default_language="lug")
    inp = Result(
        segments=[
            Segment(start=0.0, end=2.0, text="Hello world and greetings", language="und"),
        ],
        source_language="lug",
    )
    out = lid.run(inp)
    assert len(out.segments) >= 1
    assert "lid_component" in out.provenance
