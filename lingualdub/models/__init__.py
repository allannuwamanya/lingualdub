# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
LingualDub Model Hub package.
"""

from lingualdub.models.downloader import DownloadError, download_model, download_model_file
from lingualdub.models.manager import ModelManager
from lingualdub.models.registry import (
    MODEL_CATALOG,
    ModelDescriptor,
    ModelFileSpec,
    get_model_descriptor,
    list_models_by_family,
    list_models_by_language,
)

__all__ = [
    "MODEL_CATALOG",
    "DownloadError",
    "ModelDescriptor",
    "ModelFileSpec",
    "ModelManager",
    "download_model",
    "download_model_file",
    "get_model_descriptor",
    "list_models_by_family",
    "list_models_by_language",
]
