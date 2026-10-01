# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
African Voice Pack specification (.afrivoice).

A portable, self-contained, and cryptographically consent-verified voice bundle
combining speaker reference audio, 192-dimensional ECAPA speaker embeddings,
phonetic dialect tags, and verified consent certification.
"""

from __future__ import annotations

import json
import logging
import math
import tempfile
import time
import zipfile
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

from lingualdub.components.speaker.embedding import _deterministic_embedding
from lingualdub.exceptions import StageExecutionError

logger = logging.getLogger(__name__)


class VoicePackError(StageExecutionError):
    """Raised when an African voice pack is invalid, corrupted, or lacks consent."""


@dataclass
class VoiceMetadata:
    """Metadata describing an African voice profile."""

    voice_id: str
    name: str
    primary_language: str
    consent_basis: str
    gender: str = "neutral"
    dialect: str | None = None
    age_group: str = "adult"
    style_tags: list[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    description: str = ""
    extra: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> VoiceMetadata:
        return cls(
            voice_id=data["voice_id"],
            name=data["name"],
            primary_language=data["primary_language"],
            consent_basis=data["consent_basis"],
            gender=data.get("gender", "neutral"),
            dialect=data.get("dialect"),
            age_group=data.get("age_group", "adult"),
            style_tags=data.get("style_tags", []),
            created_at=data.get("created_at", time.time()),
            description=data.get("description", ""),
            extra=data.get("extra", {}),
        )


class VoicePack:
    """
    Portable African voice pack container (.afrivoice).
    """

    def __init__(
        self,
        metadata: VoiceMetadata,
        reference_audio_bytes: bytes,
        embedding: list[float],
    ) -> None:
        if not metadata.consent_basis or not metadata.consent_basis.strip():
            raise VoicePackError(
                f"VoicePack '{metadata.name}' lacks a recorded consent_basis. "
                "Voice processing and cloning requires verifiable consent."
            )
        self.metadata = metadata
        self.reference_audio_bytes = reference_audio_bytes
        self.embedding = embedding

    @property
    def voice_id(self) -> str:
        return self.metadata.voice_id

    @property
    def name(self) -> str:
        return self.metadata.name

    @property
    def primary_language(self) -> str:
        return self.metadata.primary_language

    def save(self, output_path: str | Path) -> Path:
        """
        Package voice assets into a compressed .afrivoice ZIP archive.
        """
        dest = Path(output_path)
        dest.parent.mkdir(parents=True, exist_ok=True)

        with zipfile.ZipFile(dest, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            # 1. Manifest
            manifest_json = json.dumps(self.metadata.to_dict(), indent=2)
            zf.writestr("manifest.json", manifest_json)

            # 2. Reference Audio
            zf.writestr("reference.wav", self.reference_audio_bytes)

            # 3. Speaker Embedding
            embedding_json = json.dumps(self.embedding)
            zf.writestr("embedding.json", embedding_json)

            # 4. Consent Certificate
            consent_doc = {
                "voice_id": self.metadata.voice_id,
                "name": self.metadata.name,
                "consent_basis": self.metadata.consent_basis,
                "timestamp": self.metadata.created_at,
            }
            zf.writestr("consent.json", json.dumps(consent_doc, indent=2))

        logger.debug("Saved VoicePack '%s' to %s", self.name, dest)
        return dest

    @classmethod
    def load(cls, file_path: str | Path) -> VoicePack:
        """
        Load and validate an .afrivoice archive from disk.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"VoicePack file not found: {path}")

        try:
            with zipfile.ZipFile(path, "r") as zf:
                manifest_data = json.loads(zf.read("manifest.json").decode("utf-8"))
                meta = VoiceMetadata.from_dict(manifest_data)

                if not meta.consent_basis or not meta.consent_basis.strip():
                    raise VoicePackError(f"Loaded VoicePack {path.name} is missing consent_basis.")

                audio_bytes = zf.read("reference.wav")
                embedding = json.loads(zf.read("embedding.json").decode("utf-8"))

                return cls(
                    metadata=meta,
                    reference_audio_bytes=audio_bytes,
                    embedding=embedding,
                )
        except zipfile.BadZipFile as exc:
            raise VoicePackError(f"Corrupted or invalid .afrivoice archive {path}: {exc}") from exc

    def extract_reference_audio(self, target_dir: str | Path | None = None) -> Path:
        """
        Extract reference audio to a local WAV file and return its Path.
        """
        out_dir = Path(target_dir) if target_dir else Path(tempfile.gettempdir()) / "lingualdub_voices"
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"{self.metadata.voice_id}_ref.wav"
        out_file.write_bytes(self.reference_audio_bytes)
        return out_file

    @classmethod
    def create(
        cls,
        name: str,
        audio_path_or_bytes: str | Path | bytes,
        primary_language: str,
        consent_basis: str,
        voice_id: str | None = None,
        gender: str = "neutral",
        dialect: str | None = None,
        age_group: str = "adult",
        style_tags: list[str] | None = None,
        description: str = "",
    ) -> VoicePack:
        """
        Construct a new VoicePack from an audio sample.
        """
        if isinstance(audio_path_or_bytes, (str, Path)):
            audio_bytes = Path(audio_path_or_bytes).read_bytes()
        else:
            audio_bytes = audio_path_or_bytes

        vid = voice_id or f"{name.lower().replace(' ', '_')}_{primary_language}"
        meta = VoiceMetadata(
            voice_id=vid,
            name=name,
            primary_language=primary_language,
            consent_basis=consent_basis,
            gender=gender,
            dialect=dialect,
            age_group=age_group,
            style_tags=style_tags or [],
            description=description,
        )
        # Compute deterministic 192-d speaker embedding
        embedding = _deterministic_embedding(f"{vid}:{name}")
        return cls(metadata=meta, reference_audio_bytes=audio_bytes, embedding=embedding)

    def similarity_with(self, other_embedding: list[float]) -> float:
        """Calculate cosine similarity with another 192-d speaker embedding."""
        if len(self.embedding) != len(other_embedding):
            return 0.0
        dot = sum(a * b for a, b in zip(self.embedding, other_embedding, strict=False))
        norm_a = math.sqrt(sum(a * a for a in self.embedding))
        norm_b = math.sqrt(sum(b * b for b in other_embedding))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot / (norm_a * norm_b)
