# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Neural Forced Alignment Component (Milestone 4).

Uses a pre-trained CTC acoustic model (e.g., Wav2Vec2) via Hugging Face
transformers or torchaudio to align transcript text with audio at the
word/phoneme level.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from lingualdub.components.alignment.base import AlignmentComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.resource import Resource
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment

logger = logging.getLogger(__name__)


def _distribute_word_timestamps(words: list[str], seg_start: float, seg_end: float) -> list[dict]:
    # fallback from dummy aligner
    if not words:
        return []
    total_chars = sum(len(w) for w in words) or 1
    duration = seg_end - seg_start
    timestamps = []
    cursor = seg_start
    for i, word in enumerate(words):
        frac = len(word) / total_chars
        word_dur = duration * frac
        word_start = round(cursor, 6)
        word_end = (
            round(seg_end, 6) if i == len(words) - 1 else round(min(cursor + word_dur, seg_end), 6)
        )
        timestamps.append({"word": word, "start": word_start, "end": word_end})
        cursor = word_end
    return timestamps


def _id_to_char(vocab: dict[str, int]) -> dict[int, str]:
    """Build a token-id to character map, skipping special/non-character tokens."""
    out: dict[int, str] = {}
    for token, idx in vocab.items():
        if len(token) != 1:
            continue  # specials like "<pad>", "<unk>", "<s>" are multi-char
        if token in {"<", ">", "|"} or not token.isalnum():
            continue
        out[idx] = token.upper()
    return out


def _ctc_char_frames(logits, id_to_char: dict[int, str], blank_id: int) -> list[tuple[str, int]]:
    """
    Greedy-decode CTC logits into a list of (character, first_frame_index).

    Applies the standard CTC collapse: drop blank frames and collapse repeated
    labels, recording the frame at which each surviving character is emitted.
    """
    best = logits.argmax(dim=-1)[0].tolist()
    chars: list[tuple[str, int]] = []
    previous = -1
    for frame_idx, token_id in enumerate(best):
        if token_id == previous:
            continue  # collapsed CTC repeat
        previous = token_id
        if token_id == blank_id:
            continue  # CTC blank carries no character
        char = id_to_char.get(token_id)
        if char is not None:
            chars.append((char, frame_idx))
    return chars


def _align_words_to_frames(
    words: list[str], char_frames: list[tuple[str, int]]
) -> list[tuple[int, int]] | None:
    """
    Anchor transcript words onto decoded CTC character frames.

    Walks the emitted characters and the normalized transcript together; a word
    takes the frame index of its first matched character. Returns one (start,
    end) frame pair per word, or None when the streams cannot be reconciled
    (caller then falls back to proportional distribution).

    CTC collapses a run of identical labels into a single emission, so a word
    like "hello" emits one "L" for its two "L"s. A repeated transcript letter
    therefore reuses the character just consumed rather than demanding another.
    """
    emitted = [(c, f) for c, f in char_frames]
    cursor = 0
    spans: list[tuple[int, int]] = []

    for word in words:
        letters = [ch for ch in word.upper() if ch.isalnum()]
        if not letters:
            return None
        start_frame: int | None = None
        end_frame: int | None = None
        for ch in letters:
            # A doubled letter was collapsed by CTC — reuse the last emission.
            if cursor > 0 and emitted[cursor - 1][0] == ch:
                frame = emitted[cursor - 1][1]
            else:
                # Skip ahead to the next occurrence of this character.
                while cursor < len(emitted) and emitted[cursor][0] != ch:
                    cursor += 1
                if cursor >= len(emitted):
                    return None
                frame = emitted[cursor][1]
                cursor += 1
            if start_frame is None:
                start_frame = frame
            end_frame = frame
        if start_frame is None or end_frame is None:
            return None
        spans.append((start_frame, end_frame))

    return spans or None


class NeuralForcedAlignmentComponent(AlignmentComponent):
    """
    Neural forced aligner using Wav2Vec2 CTC models to produce accurate
    word-level timestamps for spoken audio segments.
    """

    name: str = "neural_forced_aligner"
    version: str = "1.0.0"
    task: ComponentTask = ComponentTask.ALIGNMENT
    supported_languages: list[str] = ["lug", "nyn", "eng", "swa"]
    requires: list[str] = ["transcription"]
    provides: list[str] = ["aligned_timestamps"]
    on_failure: FailureMode = FailureMode.DEGRADE

    def __init__(
        self,
        model_name: str = "facebook/wav2vec2-base-960h",
        device: str | None = None,
        version: str = "1.0.0",
        resource_manager: object | None = None,
        registry: object | None = None,
    ) -> None:
        self.model_name = model_name
        self.version = version
        self.device = device
        self._resource_manager = resource_manager
        self._registry = registry
        self._processor: Any = None
        self._model: Any = None

    def _load_model(self) -> None:
        if self._model is not None:
            return
        try:
            import torch
            from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
        except ImportError as exc:
            raise RuntimeError(  # justified: missing optional heavy dependency (torch/transformers) — not a framework error
                "NeuralForcedAlignmentComponent requires 'transformers', 'torch' and 'torchaudio'. "
                "Install with: pip install torch transformers torchaudio"
            ) from exc

        device = self.device or ("cuda:0" if torch.cuda.is_available() else "cpu")
        logger.info("Loading Wav2Vec2 CTC aligner model %r on %s", self.model_name, device)
        self._processor = Wav2Vec2Processor.from_pretrained(self.model_name)
        self._model = Wav2Vec2ForCTC.from_pretrained(self.model_name).to(device)  # type: ignore[arg-type]

    def _get_audio_path(self, input_obj: Result) -> str | None:
        # Check artifacts
        for art in input_obj.artifacts:
            if (
                isinstance(art, str)
                and Path(art).suffix.lower() in (".wav", ".mp3", ".flac")
                and Path(art).exists()
            ):
                return art
        # Check provenance
        val = input_obj.provenance.get("audio_path") or input_obj.provenance.get("path")
        if isinstance(val, str) and Path(val).exists():
            return val
        return None

    def run(self, input: Result | Resource) -> Result:
        if not isinstance(input, Result):
            raise ValueError(  # justified: component input validation — not a framework config error
                f"{self.name} expects a Result, got {type(input).__name__}"
            )

        audio_path = self._get_audio_path(input)

        # Try neural alignment if audio exists, else fallback to dummy distribute
        neural_failed = False
        aligned_segments: list[Segment] = []

        if audio_path and Path(audio_path).exists():
            try:
                import torch
                import torchaudio

                self._load_model()

                device = next(self._model.parameters()).device
                waveform, sr = torchaudio.load(audio_path)

                if sr != 16000:
                    waveform = torchaudio.functional.resample(waveform, sr, 16000)
                    sr = 16000

                # Single channel
                if waveform.shape[0] > 1:
                    waveform = waveform.mean(dim=0, keepdim=True)

                waveform = waveform.squeeze(0).to(device)

                # We align segment by segment rather than whole file for simplicity
                for seg in input.segments:
                    # Snip audio for segment
                    start_sample = int(seg.start * sr)
                    end_sample = int(seg.end * sr)
                    # Safety bounds
                    start_sample = max(0, min(start_sample, waveform.shape[0]))
                    end_sample = max(start_sample + 1, min(end_sample, waveform.shape[0]))
                    seg_wav = waveform[start_sample:end_sample]

                    text = (seg.text or "").strip().upper()

                    if not text or len(seg_wav) < 400:
                        # Too short or empty for a stable CTC decode
                        word_timestamps = _distribute_word_timestamps(
                            (seg.text or "").split(), seg.start, seg.end
                        )
                        method = "proportional_fallback"
                    else:
                        try:
                            with torch.no_grad():
                                inputs = self._processor(
                                    seg_wav.cpu().numpy(), sampling_rate=sr, return_tensors="pt"
                                ).to(device)
                                logits = self._model(**inputs).logits

                            # Greedy CTC decode -> anchor transcript words onto the
                            # emitted character frames. Falls back to proportional
                            # distribution when the streams cannot be reconciled.
                            id_to_char = _id_to_char(self._processor.tokenizer.get_vocab())
                            blank_id = self._model.config.pad_token_id
                            char_frames = _ctc_char_frames(
                                logits, id_to_char, -1 if blank_id is None else blank_id
                            )
                            frame_seconds = seg_wav.shape[-1] / float(sr)
                            words = (seg.text or "").split()
                            spans = _align_words_to_frames(words, char_frames)

                            if spans is None or not frame_seconds:
                                word_timestamps = _distribute_word_timestamps(
                                    words, seg.start, seg.end
                                )
                                method = "proportional_fallback"
                            else:
                                # Map frame indices back onto the segment's wall-clock
                                # window, letting each word end where the next begins.
                                boundaries: list[tuple[float, float]] = []
                                for start_frame, end_frame in spans:
                                    rel_start = min(
                                        max(start_frame * frame_seconds, 0.0), seg.end - seg.start
                                    )
                                    rel_end = min(
                                        max((end_frame + 1) * frame_seconds, rel_start + 1e-3),
                                        seg.end - seg.start,
                                    )
                                    boundaries.append((seg.start + rel_start, seg.start + rel_end))
                                word_timestamps = [
                                    {
                                        "word": w,
                                        "start": round(boundaries[i][0], 6),
                                        "end": round(
                                            boundaries[i + 1][0]
                                            if i + 1 < len(boundaries)
                                            else seg.end,
                                            6,
                                        ),
                                    }
                                    for i, w in enumerate(words)
                                ]
                                method = "ctc_greedy"

                        except Exception as e:
                            logger.warning("Neural alignment failed for segment: %s", e)
                            word_timestamps = _distribute_word_timestamps(
                                (seg.text or "").split(), seg.start, seg.end
                            )
                            method = "proportional_fallback"

                    new_meta = dict(seg.metadata)
                    new_meta["word_timestamps"] = word_timestamps
                    new_meta["aligned"] = True
                    new_meta["alignment_method"] = method
                    aligned_seg = Segment(
                        start=seg.start,
                        end=seg.end,
                        text=seg.text,
                        language=seg.language,
                        speaker=seg.speaker,
                        confidence=seg.confidence,
                        source_language=seg.source_language,
                        provenance={**seg.provenance, "aligner": f"{self.name}@{self.version}"},
                        metadata=new_meta,
                    )
                    aligned_segments.append(aligned_seg)

            except Exception as e:
                logger.warning("Neural alignment model load/run failed: %s", e)
                neural_failed = True

        if not audio_path or neural_failed:
            # Fallback to dummy behavior exactly
            aligned_segments = []
            for seg in input.segments:
                words = (seg.text or "").split()
                word_timestamps = _distribute_word_timestamps(words, seg.start, seg.end)
                new_meta = dict(seg.metadata)
                new_meta["word_timestamps"] = word_timestamps
                new_meta["aligned"] = True
                new_meta["alignment_method"] = "proportional_fallback"
                aligned_seg = Segment(
                    start=seg.start,
                    end=seg.end,
                    text=seg.text,
                    language=seg.language,
                    speaker=seg.speaker,
                    confidence=seg.confidence,
                    source_language=seg.source_language,
                    provenance={
                        **seg.provenance,
                        "aligner": f"{self.name}@{self.version}_fallback",
                    },
                    metadata=new_meta,
                )
                aligned_segments.append(aligned_seg)

        return Result(
            segments=aligned_segments,
            source_language=input.source_language,
            target_language=input.target_language,
            warnings=list(input.warnings),
            provenance={**input.provenance, "forced_aligner": f"{self.name}@{self.version}"},
            artifacts=list(input.artifacts),
            metadata={**input.metadata, "aligned_timestamps": True},
        )
