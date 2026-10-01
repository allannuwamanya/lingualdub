"""Every YAML under ``configs/`` must load and satisfy the registry contract.

The configs are the documented entry point for users, and they are referenced by
relative path from the README, docs and notebooks. A config that references a
component key the registry cannot resolve — or that wires capabilities in an
unsatisfiable order — would otherwise only fail at runtime, on a user's machine.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from lingualdub.cli import get_default_registry
from lingualdub.pipeline.config_loader import ConfigLoader

CONFIG_DIR = Path(__file__).resolve().parents[2] / "configs"
CONFIGS = sorted(p for p in CONFIG_DIR.glob("*.yaml") if p.is_file())


def test_configs_directory_is_not_empty():
    # Guards the glob above: if configs/ moved, this suite would silently pass
    # with zero collected params.
    assert CONFIGS, f"no pipeline configs found under {CONFIG_DIR}"


@pytest.mark.parametrize("config_path", CONFIGS, ids=lambda p: p.stem)
def test_shipped_config_loads(config_path: Path):
    """ConfigLoader resolves each stage against the real registry and checks
    that declared ``requires`` are satisfied by accumulated upstream
    ``provides``."""
    loader = ConfigLoader(get_default_registry())
    pipeline = loader.load_file(config_path)

    assert pipeline.name
    assert pipeline.source_language
    assert pipeline.target_language
    assert pipeline.stages, f"{config_path.name} assembled with no stages"
