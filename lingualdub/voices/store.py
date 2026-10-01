# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
African Voice Store for cataloging and managing .afrivoice profiles.
"""

from __future__ import annotations

import logging
from pathlib import Path

from lingualdub.voices.pack import VoiceMetadata, VoicePack

logger = logging.getLogger(__name__)

DEFAULT_VOICE_STORE_DIR = Path.home() / ".cache" / "lingualdub" / "voices"


class VoiceStore:
    """
    Local storage and lookup directory for African voice packs.
    """

    def __init__(self, root_dir: str | Path | None = None) -> None:
        self.root_dir = Path(root_dir) if root_dir else DEFAULT_VOICE_STORE_DIR
        self.root_dir.mkdir(parents=True, exist_ok=True)
        self._index: dict[str, VoiceMetadata] = {}
        self.refresh()

    def refresh(self) -> None:
        """Scan disk and update metadata index."""
        self._index.clear()
        for path in self.root_dir.glob("*.afrivoice"):
            try:
                pack = VoicePack.load(path)
                self._index[pack.voice_id] = pack.metadata
            except Exception as exc:
                logger.warning("Failed loading VoicePack from %s: %s", path, exc)

    def save(self, pack: VoicePack) -> Path:
        """Save a VoicePack into the store directory."""
        target_path = self.root_dir / f"{pack.voice_id}.afrivoice"
        pack.save(target_path)
        self._index[pack.voice_id] = pack.metadata
        return target_path

    def get(self, voice_id: str) -> VoicePack | None:
        """Retrieve a full VoicePack by voice ID."""
        target_path = self.root_dir / f"{voice_id}.afrivoice"
        if not target_path.exists():
            return None
        return VoicePack.load(target_path)

    def delete(self, voice_id: str) -> bool:
        """Remove a VoicePack from the store."""
        target_path = self.root_dir / f"{voice_id}.afrivoice"
        if target_path.exists():
            target_path.unlink()
            self._index.pop(voice_id, None)
            return True
        return False

    def list_voices(
        self,
        language: str | None = None,
        gender: str | None = None,
        tag: str | None = None,
    ) -> list[VoiceMetadata]:
        """Filter stored voices by language, gender, or style tags."""
        results: list[VoiceMetadata] = []
        for meta in self._index.values():
            if language and meta.primary_language != language:
                continue
            if gender and meta.gender != gender:
                continue
            if tag and tag not in meta.style_tags:
                continue
            results.append(meta)
        return results

    def find_closest(
        self,
        target_embedding: list[float],
        language: str | None = None,
    ) -> tuple[VoicePack, float] | None:
        """
        Find the VoicePack whose speaker embedding is closest in cosine similarity.
        """
        best_pack: VoicePack | None = None
        best_score = -1.0

        for vid, meta in self._index.items():
            if language and meta.primary_language != language:
                continue
            pack = self.get(vid)
            if not pack:
                continue
            sim = pack.similarity_with(target_embedding)
            if sim > best_score:
                best_score = sim
                best_pack = pack

        if best_pack is not None:
            return best_pack, best_score
        return None
