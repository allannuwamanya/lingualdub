"""Matchers are assertion helpers — the failure branches are the product here.

A matcher that silently passes on a non-Result would make a downstream test
suite report green while asserting nothing, so each failure path is exercised
directly rather than only the happy path.
"""

from __future__ import annotations

import pytest

from lingualdub.core.resource import Resource, ResourceKind
from lingualdub.core.result import Result, ResultStatus
from lingualdub.core.segment import Segment
from lingualdub.testing.matchers import (
    assert_resource_valid,
    assert_result_complete,
    assert_result_degraded,
    assert_result_failed,
    assert_result_has_language,
    assert_result_has_segment,
    assert_result_partial,
)


def make_result(
    status: ResultStatus = ResultStatus.COMPLETE,
    segments: list[Segment] | None = None,
    warnings: list[str] | None = None,
) -> Result:
    return Result(
        segments=segments if segments is not None else [],
        source_language="lug",
        status=status,
        warnings=warnings or [],
    )


@pytest.mark.parametrize(
    ("matcher", "status"),
    [
        (assert_result_complete, ResultStatus.COMPLETE),
        (assert_result_partial, ResultStatus.PARTIAL),
        (assert_result_degraded, ResultStatus.DEGRADED),
        (assert_result_failed, ResultStatus.FAILED),
    ],
)
def test_status_matcher_passes_for_matching_status(matcher, status):
    matcher(make_result(status=status))


@pytest.mark.parametrize(
    ("matcher", "wrong_status"),
    [
        (assert_result_complete, ResultStatus.PARTIAL),
        (assert_result_partial, ResultStatus.COMPLETE),
        (assert_result_degraded, ResultStatus.COMPLETE),
        (assert_result_failed, ResultStatus.COMPLETE),
    ],
)
def test_status_matcher_rejects_mismatched_status(matcher, wrong_status):
    with pytest.raises(AssertionError):
        matcher(make_result(status=wrong_status))


@pytest.mark.parametrize(
    "matcher",
    [
        assert_result_complete,
        assert_result_partial,
        assert_result_degraded,
        assert_result_failed,
        lambda bad: assert_result_has_language(bad, "lug"),
        lambda bad: assert_result_has_segment(bad, "text"),
    ],
)
def test_matchers_reject_non_result(matcher):
    with pytest.raises(AssertionError, match="Expected Result"):
        matcher("not a result")


def test_assert_result_failed_rejects_usable_result():
    """FAILED must not be usable — that invariant is what the matcher guards."""
    result = make_result(status=ResultStatus.FAILED)
    assert not result.is_usable
    assert_result_failed(result)


def test_assert_result_has_segment_matches_and_returns_segment():
    seg = Segment(start=0.0, end=1.0, text="Oli otya", language="lug")
    result = make_result(segments=[seg])

    assert assert_result_has_segment(result, "Oli") is seg


def test_assert_result_has_segment_honours_language_filter():
    lug = Segment(start=0.0, end=1.0, text="hello", language="lug")
    eng = Segment(start=1.0, end=2.0, text="hello world", language="eng")
    result = make_result(segments=[lug, eng])

    assert assert_result_has_segment(result, "world", language="eng") is eng

    with pytest.raises(AssertionError, match="language='nyn'"):
        assert_result_has_segment(result, "hello", language="nyn")


def test_assert_result_has_segment_error_lists_available_segments():
    seg = Segment(start=0.0, end=1.0, text="Oli otya", language="lug")
    result = make_result(segments=[seg])

    with pytest.raises(AssertionError) as exc:
        assert_result_has_segment(result, "missing text")

    # The message must help the reader see what was actually available.
    assert "Oli otya" in str(exc.value)
    assert "lug" in str(exc.value)


def test_assert_result_has_segment_on_empty_result_reports_no_segments():
    with pytest.raises(AssertionError, match=r"\(no segments\)"):
        assert_result_has_segment(make_result(), "anything")


def test_assert_result_has_segment_rejects_non_string_text():
    result = make_result(segments=[Segment(start=0.0, end=1.0, text="x", language="lug")])
    with pytest.raises(AssertionError, match="text must be str"):
        assert_result_has_segment(result, 42)  # type: ignore[arg-type]


def test_assert_result_has_language_passes_and_reports_present_languages():
    result = make_result(
        segments=[
            Segment(start=0.0, end=1.0, text="a", language="lug"),
            Segment(start=1.0, end=2.0, text="b", language="eng"),
        ]
    )
    assert_result_has_language(result, "eng")

    with pytest.raises(AssertionError) as exc:
        assert_result_has_language(result, "nyn")
    assert "nyn" in str(exc.value)


def test_assert_resource_valid_round_trips():
    resource = Resource(
        id="lug_speech_v1",
        kind=ResourceKind.SPEECH,
        language="lug",
        version="1.0.0",
    )
    assert_resource_valid(resource)


def test_assert_resource_valid_rejects_non_resource():
    with pytest.raises(AssertionError, match="Expected Resource"):
        assert_resource_valid({"id": "lug_speech_v1"})
