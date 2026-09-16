"""
Unit tests for Milestone 13 — Data Flywheel Evaluator.
"""

import json

from lingualdub.components.alignment.time_stretch import _write_wav_samples
from lingualdub.components.eval.flywheel import DataFlywheelComponent, _snip_wav
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment


def test_snip_wav(tmp_path):
    src = tmp_path / "full.wav"
    dst = tmp_path / "slice.wav"
    _write_wav_samples(src, [0.1] * 32000, sample_rate=16000)  # 2.0s

    success = _snip_wav(src, dst, start_sec=0.5, end_sec=1.5)
    assert success is True
    assert dst.exists()
    assert dst.stat().st_size > 0


def test_data_flywheel_flags_low_confidence(tmp_path):
    src_wav = tmp_path / "source.wav"
    _write_wav_samples(src_wav, [0.1] * 16000, sample_rate=16000)

    flywheel = DataFlywheelComponent(
        confidence_threshold=0.70,
        output_dir=str(tmp_path / "flywheel_out"),
        dataset_name="test_dataset",
        snip_audio=True,
    )

    inp = Result(
        segments=[
            Segment(start=0.0, end=0.5, text="Good confidence", language="lug", confidence=0.95),
            Segment(start=0.5, end=1.0, text="Low confidence", language="lug", confidence=0.45),
        ],
        source_language="lug",
        target_language="eng",
        artifacts=[str(src_wav)],
    )

    out = flywheel.run(inp)
    assert "data_flywheel" in out.metadata
    metrics = out.metadata["data_flywheel"]
    assert metrics["flagged_samples_count"] == 1
    assert metrics["total_segments"] == 2

    # Verify JSONL export
    jsonl_file = tmp_path / "flywheel_out" / "test_dataset.jsonl"
    assert jsonl_file.exists()
    with open(jsonl_file, encoding="utf-8") as f:
        lines = f.readlines()
    assert len(lines) == 1
    record = json.loads(lines[0])
    assert record["text"] == "Low confidence"
    assert record["confidence"] == 0.45
    assert record["audio_snippet"] is not None
