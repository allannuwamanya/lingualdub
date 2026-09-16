# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Neural Language Identification (LID) component.

Uses a transformer-based language detection model (e.g., xlm-roberta) to accurately
identify language boundaries in mixed-language utterances.
"""

from __future__ import annotations

import logging

from lingualdub.components.code_switch.base import CodeSwitchComponent
from lingualdub.core.component import ComponentTask, FailureMode
from lingualdub.core.resource import Resource
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment

logger = logging.getLogger(__name__)


class NeuralLIDComponent(CodeSwitchComponent):
    """
    Neural Language Identification component for accurate code-switch detection.
    """

    name: str = "neural_lid"
    version: str = "1.0.0"
    task: ComponentTask = ComponentTask.CODE_SWITCH
    supported_languages: list[str] = ["lug", "nyn", "eng", "swa"]
    requires: list[str] = ["transcription"]
    provides: list[str] = ["language_labels", "code_switch_detection"]
    on_failure: FailureMode = FailureMode.DEGRADE

    def __init__(
        self,
        model_name: str = "papluca/xlm-roberta-base-language-detection",
        default_language: str = "lug",
        split_segments: bool = True,
        confidence_threshold: float = 0.6,
        version: str = "1.0.0",
        device: str | None = None,
    ) -> None:
        self.model_name = model_name
        self.default_language = default_language
        self.split_segments = split_segments
        self.confidence_threshold = confidence_threshold
        self.version = version
        self.device = device
        self._pipeline = None

    def _load_model(self) -> None:
        if self._pipeline is not None:
            return
        try:
            import torch
            from transformers import pipeline

            device = self.device or ("cuda:0" if torch.cuda.is_available() else "cpu")
            logger.info("Loading Neural LID model %r on %s", self.model_name, device)
            self._pipeline = pipeline("text-classification", model=self.model_name, device=device)
        except Exception as exc:
            logger.warning("Failed to load Neural LID model: %s", exc)
            self._pipeline = "failed"

    def _map_lang_code(self, model_label: str) -> str:
        """Map standard 2-letter ISO to our framework 3-letter codes."""
        mapping = {
            "en": "eng",
            "sw": "swa",
            "fr": "fra",
            "de": "deu",
            # Add heuristics for Luganda/Runyankole as they might be predicted as 'sw' or others
            # depending on the model. 
        }
        return mapping.get(model_label, self.default_language)

    def classify_text(self, text: str) -> tuple[str, float]:
        self._load_model()
        if self._pipeline == "failed" or not self._pipeline:
            return self.default_language, 0.5
        
        try:
            res = self._pipeline(text[:512], truncation=True)
            if res and isinstance(res, list):
                label = res[0]["label"]
                score = res[0]["score"]
                return self._map_lang_code(label), score
        except Exception:
            pass
        return self.default_language, 0.5

    def _split_mixed_segment(self, seg: Segment, default_lang: str) -> list[Segment]:
        """Split a segment into language-pure sub-segments if code-switching is detected."""
        text = (seg.text or "").strip()
        tokens = text.split()
        if len(tokens) <= 1:
            dominant_lang, conf = self.classify_text(text)
            return [
                seg.replace(
                    language=dominant_lang,
                    confidence=seg.confidence or conf,
                    metadata={**seg.metadata, "lid_confidence": conf, "neural_lid_used": True},
                )
            ]

        # Classify sub-clause blocks (e.g. pairs of words or tokens)
        spans: list[tuple[str, list[str]]] = []
        for word in tokens:
            w_lang, _ = self.classify_text(word)
            if not spans or spans[-1][0] != w_lang:
                spans.append((w_lang, [word]))
            else:
                spans[-1][1].append(word)

        if len(spans) <= 1:
            dominant_lang, conf = self.classify_text(text)
            return [
                seg.replace(
                    language=dominant_lang,
                    confidence=seg.confidence or conf,
                    metadata={**seg.metadata, "lid_confidence": conf, "neural_lid_used": True},
                )
            ]

        # Multiple language spans detected -> split temporally
        duration = max(0.1, seg.end - seg.start)
        total_words = len(tokens)
        sub_segments: list[Segment] = []
        curr_start = seg.start

        for idx, (span_lang, span_words) in enumerate(spans):
            span_frac = len(span_words) / total_words
            span_dur = duration * span_frac
            span_end = seg.end if idx == len(spans) - 1 else curr_start + span_dur
            span_text = " ".join(span_words)

            sub_segments.append(
                Segment(
                    start=round(curr_start, 6),
                    end=round(span_end, 6),
                    text=span_text,
                    language=span_lang,
                    source_language=seg.source_language,
                    speaker=seg.speaker,
                    confidence=seg.confidence,
                    provenance={**seg.provenance, "neural_lid_split": f"{self.name}@{self.version}"},
                    metadata={
                        **seg.metadata,
                        "code_switch_split": True,
                        "span_index": idx,
                        "span_language": span_lang,
                    },
                )
            )
            curr_start = span_end

        return sub_segments

    def run(self, input: Result | Resource) -> Result:
        if not isinstance(input, Result):
            raise ValueError(f"NeuralLIDComponent expects a Result input, got {type(input).__name__}")

        processed_segments: list[Segment] = []
        code_switch_count = 0

        for seg in input.segments:
            if self.split_segments:
                split_segs = self._split_mixed_segment(seg, self.default_language)
                if len(split_segs) > 1:
                    code_switch_count += 1
                processed_segments.extend(split_segs)
            else:
                dominant_lang, conf = self.classify_text(seg.text or "")
                updated_seg = Segment(
                    start=seg.start,
                    end=seg.end,
                    text=seg.text,
                    language=dominant_lang,
                    source_language=seg.source_language or input.source_language,
                    speaker=seg.speaker,
                    confidence=seg.confidence or conf,
                    metadata={
                        **seg.metadata,
                        "lid_confidence": conf,
                        "neural_lid_used": True,
                    },
                )
                processed_segments.append(updated_seg)

        res = Result(
            segments=processed_segments,
            source_language=input.source_language,
            target_language=input.target_language,
            warnings=list(input.warnings),
            provenance={**input.provenance, "lid_component": f"{self.name}@{self.version}"},
            artifacts=list(input.artifacts),
            metadata={
                **input.metadata,
                "code_switch_detection": {
                    "detected_switches": code_switch_count,
                    "final_segment_count": len(processed_segments),
                },
            },
        )
        return res
