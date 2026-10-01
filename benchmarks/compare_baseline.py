#!/usr/bin/env python3
# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Compare a pytest-benchmark JSON run against the committed baseline.

Fails when any benchmark's mean time regresses by more than a configurable
factor (default 10x). Missing or malformed inputs are reported rather than
silently ignored, so the check cannot pass by doing nothing.

Usage:
    python benchmarks/compare_baseline.py \
        --baseline benchmarks/baselines/baseline.json \
        --current benchmarks/baselines/latest.json \
        [--max-regression-factor 10]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def load_means(path: Path) -> dict[str, float]:
    """Map benchmark fullname -> mean seconds from a pytest-benchmark JSON file."""
    data = json.loads(path.read_text(encoding="utf-8"))
    means: dict[str, float] = {}
    for entry in data.get("benchmarks", []):
        name = entry.get("fullname") or entry.get("name")
        stats = entry.get("stats") or {}
        mean = stats.get("mean")
        if name and mean is not None:
            means[name] = float(mean)
    return means


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", type=Path, required=True)
    parser.add_argument("--current", type=Path, required=True)
    parser.add_argument(
        "--max-regression-factor",
        type=float,
        default=10.0,
        help="Fail if a benchmark's mean exceeds the baseline by more than this factor.",
    )
    args = parser.parse_args(argv)

    for label, path in (("baseline", args.baseline), ("current", args.current)):
        if not path.exists():
            print(f"ERROR: {label} file not found: {path}", file=sys.stderr)
            return 2

    try:
        baseline = load_means(args.baseline)
        current = load_means(args.current)
    except (json.JSONDecodeError, OSError) as exc:
        print(f"ERROR: could not parse benchmark JSON: {exc}", file=sys.stderr)
        return 2

    if not current:
        print("ERROR: current benchmark run produced no results.", file=sys.stderr)
        return 2
    if not baseline:
        print("WARNING: baseline contains no benchmarks; nothing to compare.")
        return 0

    regressions: list[str] = []
    missing = sorted(set(current) - set(baseline))

    for name, cur_mean in sorted(current.items()):
        base_mean = baseline.get(name)
        if base_mean is None:
            continue
        if cur_mean <= 0:
            continue
        ratio = cur_mean / base_mean
        if ratio > args.max_regression_factor:
            regressions.append(
                f"  {name}: {cur_mean:.6g}s vs baseline {base_mean:.6g}s ({ratio:.1f}x regression)"
            )

    print(f"Compared {len(current)} benchmarks against {len(baseline)} baseline entries.")
    if missing:
        print(f"Note: {len(missing)} benchmark(s) are new (no baseline): {', '.join(missing[:5])}")

    if regressions:
        print(
            f"\nFAIL: {len(regressions)} benchmark(s) regressed beyond "
            f"{args.max_regression_factor}x:",
            file=sys.stderr,
        )
        print("\n".join(regressions), file=sys.stderr)
        return 1

    print("OK: no benchmark exceeded the regression threshold.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
