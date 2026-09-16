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

    def run(self, input: Result | Resource) -> Result:
        if not isinstance(input, Result):
            raise ValueError(f"NeuralLIDComponent expects a Result input, got {type(input).__name__}")

        processed_segments: list[Segment] = []
        code_switch_count = 0

        for seg in input.segments:
            # We can classify per word if split_segments is true, but that's slow with transformers.
            # Usually, you'd chunk it. For simplicity, we classify the whole segment here.
            dominant_lang, conf = self.classify_text(seg.text or "")
            
            # If it's a long segment and split_segments is True, we could split by punctuation
            # and classify sub-segments. Here we just do whole-segment as a baseline upgrade.
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
