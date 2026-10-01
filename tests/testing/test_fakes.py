"""Fake component tests.

The fakes ship in the public package and stand in for real models across
downstream test suites, so their contracts — especially the ``Resource``-vs-
``Result`` input handling and the ``degrade()`` fallbacks — need to hold
exactly. Each fake either accepts ``Resource`` deliberately or rejects it with
a clear error; that split is asserted here so a future edit can't make one
quietly accept the wrong shape.
"""

from __future__ import annotations

import pytest

from lingualdub.core.resource import Resource, ResourceKind
from lingualdub.core.result import Result, ResultStatus
from lingualdub.core.segment import Segment
from lingualdub.testing.fakes import (
    FakeAlignment,
    FakeASR,
    FakeEvaluator,
    FakeTranslation,
    FakeTTS,
)


def make_resource(language: str = "lug") -> Resource:
    return Resource(
        id="lug_speech_v1",
        kind=ResourceKind.SPEECH,
        language=language,
        version="1.0.0",
    )


def make_result(language: str = "lug") -> Result:
    return Result(
        segments=[Segment(start=0.0, end=2.0, text="Oli otya", language=language)],
        source_language=language,
    )


class TestFakeASR:
    def test_run_from_result_uses_source_language(self):
        result = FakeASR(text="hello").run(make_result("lug"))
        assert result.source_language == "lug"
        assert result.segments[0].text == "hello"
        assert result.segments[0].confidence == 0.99
        assert result.metadata["model"] == "fake_asr"

    def test_run_from_resource_uses_resource_language(self):
        result = FakeASR(text="hello").run(make_resource("nyn"))
        assert result.source_language == "nyn"

    def test_run_falls_back_to_configured_language(self):
        # An input carrying no language at all must not yield source_language=None.
        result = FakeASR(text="hello", language="swa").run(object())
        assert result.source_language == "swa"

    def test_degrade_marks_status_and_lowers_confidence(self):
        result = FakeASR(text="partial").degrade(make_result())
        assert result.status == ResultStatus.DEGRADED
        assert result.segments[0].confidence == 0.5
        assert result.warnings


class TestFakeTranslation:
    def test_run_translates_segments(self):
        result = FakeTranslation().run(make_result())
        assert result.target_language == "eng"
        assert all(s.text.endswith("(translated)") for s in result.segments)

    def test_run_rejects_resource_input(self):
        with pytest.raises(ValueError, match="FakeTranslation expects"):
            FakeTranslation().run(make_resource())


class TestFakeTTS:
    def test_run_emits_one_artifact_per_segment(self):
        result = FakeTTS().run(make_result())
        assert len(result.artifacts) == 1
        assert result.metadata["synthesized"] is True

    def test_default_target_language_when_absent(self):
        result = FakeTTS().run(make_result())
        assert result.target_language == "eng"

    def test_preserves_explicit_target_language(self):
        result = FakeTTS().run(make_result().replace(target_language="fra"))
        assert result.target_language == "fra"

    def test_run_rejects_resource_input(self):
        with pytest.raises(ValueError, match="FakeTTS expects"):
            FakeTTS().run(make_resource())

    def test_degrade_on_result_drops_artifacts_but_keeps_segments(self):
        result = FakeTTS().degrade(make_result())
        assert result.status == ResultStatus.DEGRADED
        assert result.artifacts == []
        assert len(result.segments) == 1

    def test_degrade_on_resource_returns_empty_degraded_result(self):
        result = FakeTTS().degrade(make_resource())
        assert result.status == ResultStatus.DEGRADED
        # Result hardens `segments` to a tuple in __post_init__.
        assert len(result.segments) == 0
        assert result.artifacts == []


class TestFakeAlignment:
    def test_run_assigns_word_timestamps_evenly(self):
        seg = Segment(start=0.0, end=3.0, text="one two three", language="lug")
        result = FakeAlignment().run(make_result().replace(segments=[seg]))

        words = result.segments[0].metadata["word_timestamps"]
        assert [w["word"] for w in words] == ["one", "two", "three"]
        assert words[0]["start"] == 0.0
        assert words[-1]["end"] == pytest.approx(3.0)

    def test_run_preserves_existing_segment_metadata(self):
        seg = Segment(start=0.0, end=2.0, text="a b", language="lug", metadata={"kept": True})
        result = FakeAlignment().run(make_result().replace(segments=[seg]))
        assert result.segments[0].metadata["kept"] is True

    def test_empty_segment_text_does_not_divide_by_zero(self):
        seg = Segment(start=0.0, end=0.0, text="", language="lug")
        result = FakeAlignment().run(make_result().replace(segments=[seg]))
        assert result.segments[0].metadata["word_timestamps"] == []

    def test_run_rejects_resource_input(self):
        with pytest.raises(ValueError, match="FakeAlignment expects"):
            FakeAlignment().run(make_resource())


class TestFakeEvaluator:
    def test_run_on_result_attaches_metrics(self):
        result = FakeEvaluator().run(make_result())
        assert result.metadata["metrics"]["wer"] == pytest.approx(0.10)
        assert result.metadata["metrics"]["bleu"] == pytest.approx(45.0)

    def test_run_on_resource_returns_baseline_metrics(self):
        result = FakeEvaluator().run(make_resource())
        assert len(result.segments) == 0
        assert result.metadata["metrics"]["wer"] == pytest.approx(0.12)

    def test_evaluate_pair_delegates_to_run(self):
        hypothesis = make_result()
        result = FakeEvaluator().evaluate_pair(hypothesis, make_resource())
        assert result.metadata["metrics"]
