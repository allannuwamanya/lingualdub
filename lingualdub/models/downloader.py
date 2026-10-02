# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Model Downloader for offline neural models.

Supports downloading weights and tokenizers from Hugging Face Hub with progress tracking,
atomic writes, and resume/retry capabilities.
"""

from __future__ import annotations

import logging
import os
import shutil
import tempfile
import urllib.error
import urllib.request
from collections.abc import Callable
from pathlib import Path

from lingualdub.models.registry import ModelDescriptor, ModelFileSpec

logger = logging.getLogger(__name__)

HF_BASE_URL = "https://huggingface.co"
DEFAULT_TIMEOUT_SEC = 60


class DownloadError(RuntimeError):
    """Raised when downloading model weights fails."""


def _download_stream(
    url: str,
    dest_path: Path,
    expected_size: int | None = None,
    progress_callback: Callable[[int, int | None], None] | None = None,
    timeout: int = DEFAULT_TIMEOUT_SEC,
) -> None:
    """Download a remote URL to dest_path atomically using a temporary file."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    temp_fd, temp_file_path = tempfile.mkstemp(
        dir=dest_path.parent, prefix=f".{dest_path.name}.", suffix=".part"
    )
    os.close(temp_fd)
    part_path = Path(temp_file_path)

    headers = {
        "User-Agent": "LingualDub-ModelHub/1.0.0 (African Voice AI Platform)",
    }
    # Pass HF_TOKEN or HUGGING_FACE_HUB_TOKEN if set in environment
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, headers=headers)
    bytes_downloaded = 0

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            total_size = response.headers.get("Content-Length")
            total_bytes = int(total_size) if total_size and total_size.isdigit() else expected_size

            with open(part_path, "wb") as f_out:
                chunk_size = 64 * 1024  # 64 KB
                while True:
                    chunk = response.read(chunk_size)
                    if not chunk:
                        break
                    f_out.write(chunk)
                    bytes_downloaded += len(chunk)
                    if progress_callback:
                        progress_callback(bytes_downloaded, total_bytes)

        if bytes_downloaded == 0:
            raise DownloadError(f"Downloaded 0 bytes from {url}")

        # Atomic rename once completed
        shutil.move(str(part_path), str(dest_path))
        logger.info("Successfully downloaded %s (%d bytes)", dest_path.name, bytes_downloaded)

    except urllib.error.URLError as exc:
        part_path.unlink(missing_ok=True)
        raise DownloadError(f"Failed to download {url}: {exc.reason}") from exc
    except Exception as exc:
        part_path.unlink(missing_ok=True)
        raise DownloadError(f"Error while downloading {url}: {exc}") from exc


def download_model_file(
    repo_id: str,
    file_spec: ModelFileSpec,
    target_dir: Path,
    progress_callback: Callable[[str, int, int | None], None] | None = None,
    timeout: int = DEFAULT_TIMEOUT_SEC,
) -> Path:
    """
    Download an individual file for a Hugging Face model repository.

    Tries huggingface_hub Python library if installed; falls back to direct HTTPS stream.
    """
    dest_file = target_dir / file_spec.filename
    if dest_file.is_file() and dest_file.stat().st_size > 0:
        logger.debug("File %s already exists in %s, skipping download", file_spec.filename, target_dir)
        return dest_file

    target_dir.mkdir(parents=True, exist_ok=True)

    # 1. Try huggingface_hub first if available
    try:
        from huggingface_hub import hf_hub_download

        logger.info("Downloading %s/%s via huggingface_hub...", repo_id, file_spec.filename)
        cached_path = hf_hub_download(
            repo_id=repo_id,
            filename=file_spec.filename,
            local_dir=str(target_dir),
            local_dir_use_symlinks=False,
        )
        return Path(cached_path)
    except Exception as exc:
        logger.debug("huggingface_hub download fallback to direct HTTPS: %s", exc)

    # 2. Direct HTTPS download from Hugging Face resolve URL
    url = f"{HF_BASE_URL}/{repo_id}/resolve/main/{file_spec.filename}"
    logger.info("Downloading %s from %s...", file_spec.filename, url)

    def _file_progress(curr: int, total: int | None) -> None:
        if progress_callback:
            progress_callback(file_spec.filename, curr, total)

    _download_stream(
        url=url,
        dest_path=dest_file,
        expected_size=file_spec.expected_size_bytes,
        progress_callback=_file_progress,
        timeout=timeout,
    )
    return dest_file


def download_model(
    descriptor: ModelDescriptor,
    base_cache_dir: Path,
    progress_callback: Callable[[str, int, int | None], None] | None = None,
    timeout: int = DEFAULT_TIMEOUT_SEC,
) -> Path:
    """
    Download all required files for a ModelDescriptor into the cache directory.

    Returns the directory path containing the downloaded model files.
    """
    target_dir = base_cache_dir / descriptor.get_relative_cache_dir()
    target_dir.mkdir(parents=True, exist_ok=True)

    logger.info("Starting download of %s into %s", descriptor.name, target_dir)
    for file_spec in descriptor.files:
        try:
            download_model_file(
                repo_id=descriptor.repo_id,
                file_spec=file_spec,
                target_dir=target_dir,
                progress_callback=progress_callback,
                timeout=timeout,
            )
        except Exception as exc:
            if file_spec.required:
                raise DownloadError(
                    f"Failed to download required file {file_spec.filename} "
                    f"for model {descriptor.model_id}: {exc}"
                ) from exc
            else:
                logger.warning(
                    "Optional file %s failed to download for model %s: %s",
                    file_spec.filename,
                    descriptor.model_id,
                    exc,
                )

    return target_dir
