# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Model Manager for offline neural models.

Provides unified discovery, status tracking, download orchestration,
and disk lifecycle management for offline speech, ASR, and translation models.
"""

from __future__ import annotations

import logging
import os
import shutil
from collections.abc import Callable
from pathlib import Path
from typing import Any

from lingualdub.models.downloader import download_model
from lingualdub.models.registry import (
    MODEL_CATALOG,
    ModelDescriptor,
    get_model_descriptor,
)

logger = logging.getLogger(__name__)

DEFAULT_MODELS_CACHE_DIR = Path.home() / ".cache" / "lingualdub" / "models"


class ModelManager:
    """
    Manages local cache, download status, and resolution of offline neural models.
    """

    def __init__(self, cache_dir: Path | str | None = None) -> None:
        if cache_dir:
            self.cache_dir = Path(cache_dir)
        elif "LINGUALDUB_MODELS_DIR" in os.environ:
            self.cache_dir = Path(os.environ["LINGUALDUB_MODELS_DIR"])
        elif "LINGUALDUB_CACHE_DIR" in os.environ:
            self.cache_dir = Path(os.environ["LINGUALDUB_CACHE_DIR"]) / "models"
        else:
            self.cache_dir = DEFAULT_MODELS_CACHE_DIR

        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def get_model_dir(self, descriptor: ModelDescriptor) -> Path:
        """Get the expected local directory for a model."""
        return self.cache_dir / descriptor.get_relative_cache_dir()

    def is_downloaded(self, model_id: str) -> bool:
        """Check if all required files for a model exist in the local cache."""
        descriptor = get_model_descriptor(model_id)
        if not descriptor:
            return False

        model_dir = self.get_model_dir(descriptor)
        if not model_dir.is_dir():
            return False

        for f in descriptor.files:
            if f.required:
                file_path = model_dir / f.filename
                if not file_path.is_file() or file_path.stat().st_size == 0:
                    return False
        return True

    def get_model_path(self, model_id: str) -> Path | None:
        """Return the local directory for a model if downloaded, else None."""
        if self.is_downloaded(model_id):
            descriptor = get_model_descriptor(model_id)
            if descriptor:
                return self.get_model_dir(descriptor)
        return None

    def get_installed_size_bytes(self, model_id: str) -> int:
        """Compute the total bytes used by a model on disk."""
        descriptor = get_model_descriptor(model_id)
        if not descriptor:
            return 0

        model_dir = self.get_model_dir(descriptor)
        if not model_dir.is_dir():
            return 0

        total_bytes = 0
        for entry in model_dir.iterdir():
            if entry.is_file():
                total_bytes += entry.stat().st_size
        return total_bytes

    def get_model_status(self, model_id: str) -> dict[str, Any]:
        """Return comprehensive status information for a model."""
        descriptor = get_model_descriptor(model_id)
        if not descriptor:
            raise KeyError(f"Model ID '{model_id}' is not in catalog.")

        downloaded = self.is_downloaded(model_id)
        model_dir = self.get_model_dir(descriptor)
        installed_bytes = self.get_installed_size_bytes(model_id)

        return {
            "model_id": descriptor.model_id,
            "name": descriptor.name,
            "family": descriptor.family,
            "task": descriptor.task,
            "languages": descriptor.languages,
            "repo_id": descriptor.repo_id,
            "size_mb": descriptor.size_mb,
            "ram_mb": descriptor.ram_mb,
            "license": descriptor.license,
            "description": descriptor.description,
            "tags": descriptor.tags,
            "is_downloaded": downloaded,
            "installed_size_bytes": installed_bytes,
            "installed_size_mb": round(installed_bytes / (1024 * 1024), 2),
            "local_path": str(model_dir) if downloaded else None,
        }

    def list_models(
        self,
        family: str | None = None,
        task: str | None = None,
        language: str | None = None,
    ) -> list[dict[str, Any]]:
        """List all catalog models matching optional filters."""
        results: list[dict[str, Any]] = []
        for model_id, descriptor in MODEL_CATALOG.items():
            if family and descriptor.family != family:
                continue
            if task and descriptor.task != task:
                continue
            if (
                language
                and language not in descriptor.languages
                and "mul" not in descriptor.languages
            ):
                continue
            results.append(self.get_model_status(model_id))
        return results

    def download(
        self,
        model_id: str,
        progress_callback: Callable[[str, int, int | None], None] | None = None,
        timeout: int = 60,
    ) -> Path:
        """Download model weights and return the local model directory path."""
        descriptor = get_model_descriptor(model_id)
        if not descriptor:
            raise KeyError(f"Unknown model ID: '{model_id}'")

        return download_model(
            descriptor=descriptor,
            base_cache_dir=self.cache_dir,
            progress_callback=progress_callback,
            timeout=timeout,
        )

    def delete(self, model_id: str) -> bool:
        """Remove a model from local cache to reclaim disk space."""
        descriptor = get_model_descriptor(model_id)
        if not descriptor:
            return False

        model_dir = self.get_model_dir(descriptor)
        if model_dir.is_dir():
            shutil.rmtree(model_dir)
            logger.info("Deleted model cache at %s", model_dir)
            return True
        return False

    def find_mms_model_for_language(self, language: str) -> Path | None:
        """Resolve the local directory for a Sherpa MMS language model."""
        model_id = f"sherpa_mms_{language.lower()}"
        return self.get_model_path(model_id)
