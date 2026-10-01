"""FakeClock tests — including the install/uninstall path.

``install()`` monkeypatches the real ``time`` module, so its restore behaviour
is the part that can leak into unrelated tests if it regresses. The
idempotence guards (installing or uninstalling twice) are asserted explicitly
rather than assumed.
"""

from __future__ import annotations

import time
from datetime import datetime, timezone

import pytest

from lingualdub.testing.clock import FakeClock


def test_starts_at_zero_and_advances():
    clock = FakeClock()
    assert clock.now() == 0.0
    clock.advance(1.5)
    assert clock.now() == 1.5


def test_time_alias_and_callable_report_current_time():
    clock = FakeClock(start=100.0)
    assert clock.time() == clock.now() == 100.0
    assert clock() == 100.0
    assert clock.monotonic() == 100.0


def test_sleep_advances_and_is_recorded():
    clock = FakeClock()
    clock.sleep(0.5)
    clock.sleep(2)
    assert clock.now() == 2.5
    assert clock.sleeps == [0.5, 2.0]


def test_sleeps_property_returns_a_copy():
    clock = FakeClock()
    clock.sleep(1.0)
    clock.sleeps.append(99.0)  # mutating the copy must not affect the clock
    assert clock.sleeps == [1.0]


def test_reset_restores_time_and_clears_sleeps():
    clock = FakeClock(start=50.0)
    clock.sleep(1.0)
    clock.reset(start=7.0)
    assert clock.now() == 7.0
    assert clock.sleeps == []


def test_datetime_now_is_derived_from_current_time():
    clock = FakeClock(start=0.0)
    assert clock.datetime_now() == datetime(1970, 1, 1, tzinfo=timezone.utc)

    clock.advance(60.0)
    assert clock.datetime_now() == datetime(1970, 1, 1, 0, 1, tzinfo=timezone.utc)


def test_datetime_now_honours_timezone():
    clock = FakeClock(start=0.0)
    naive = clock.datetime_now(tz=None)
    assert naive.tzinfo is None


@pytest.mark.parametrize("bad", ["1.0", None, True])
def test_rejects_non_numeric_start(bad):
    with pytest.raises(ValueError, match="start must be a number"):
        FakeClock(start=bad)


@pytest.mark.parametrize("bad", ["1.0", None, True])
def test_rejects_non_numeric_advance(bad):
    clock = FakeClock()
    with pytest.raises(ValueError, match="advance seconds must be a number"):
        clock.advance(bad)


def test_rejects_negative_advance():
    clock = FakeClock()
    with pytest.raises(ValueError, match="must be >= 0"):
        clock.advance(-1.0)


def test_repr_shows_current_time():
    assert repr(FakeClock(start=3.5)) == "FakeClock(time=3.5)"


def test_install_and_uninstall_patch_and_restore_time(monkeypatch):
    real_time = time.time
    real_monotonic = time.monotonic
    clock = FakeClock(start=500.0)

    clock.install()
    try:
        assert time.time() == 500.0
        assert time.monotonic() == 500.0
    finally:
        clock.uninstall()

    assert time.time is real_time
    assert time.monotonic is real_monotonic


def test_install_and_uninstall_are_idempotent():
    real_time = time.time
    clock = FakeClock(start=1.0)

    clock.install()
    clock.install()  # second install must not overwrite the saved originals
    clock.uninstall()
    clock.uninstall()  # second uninstall must not restore the fake

    assert time.time is real_time


def test_context_manager_installs_and_restores():
    real_time = time.time
    with FakeClock(start=42.0) as clock:
        assert time.time() == 42.0
        assert clock.now() == 42.0
    assert time.time is real_time


def test_context_manager_restores_on_exception():
    real_time = time.time
    with pytest.raises(RuntimeError), FakeClock(start=42.0):
        assert time.time() == 42.0
        raise RuntimeError("boom")
    assert time.time is real_time
