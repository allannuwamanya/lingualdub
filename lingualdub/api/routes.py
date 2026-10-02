# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
API request handlers for OpenAI & ElevenLabs-compatible speech endpoints.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from lingualdub.components.tts.dummy import DummyTTSComponent
from lingualdub.components.tts.shared import write_dummy_wav
from lingualdub.core.result import Result
from lingualdub.core.segment import Segment
from lingualdub.voices.gallery import get_preset_voice, list_presets
from lingualdub.voices.pack import VoicePack
from lingualdub.voices.store import VoiceStore

logger = logging.getLogger(__name__)


class SpeechAPIHandler:
    """
    Handles speech synthesis, transcription, and voice management operations.
    """

    def __init__(self, voice_store: VoiceStore | None = None) -> None:
        self.voice_store = voice_store or VoiceStore()

    def handle_synthesize_speech(self, payload: dict[str, Any]) -> tuple[bytes, str]:
        """
        Synthesize speech audio from text (OpenAI POST /v1/audio/speech equivalent).

        Args:
            payload: Dict containing:
                - input (str): text to synthesize
                - voice (str): voice ID or preset name (default: "kigozi_lug")
                - model (str): TTS engine ("sunbird", "sherpa_mms", "omnivoice", "dummy")
                - speed (float): playback speed multiplier (default: 1.0)
                - language (str): language code (default: "lug")

        Returns:
            Tuple of (audio_bytes, content_type).
        """
        text = payload.get("input", "").strip()
        if not text:
            raise ValueError("Input text cannot be empty.")

        voice_id = payload.get("voice", "kigozi_lug")
        api_key = payload.get("api_key") or os.environ.get("SUNBIRD_API_KEY")
        model = payload.get("model", "sunbird" if api_key else "dummy").lower()
        speed = float(payload.get("speed", 1.0))
        language = payload.get("language", "lug")

        # Resolve voice pack or preset for consent and timbre
        voice_pack: VoicePack | None = self.voice_store.get(voice_id)
        if not voice_pack:
            try:
                voice_pack = get_preset_voice(voice_id)
            except KeyError:
                logger.debug("Voice %r not found in presets; using default consent", voice_id)

        consent_basis = voice_pack.metadata.consent_basis if voice_pack else "api_explicit_consent_granted"

        # Generate audio using the requested engine
        if model in ("sunbird", "sunbird_tts"):
            from lingualdub.components.tts.sunbird import SunbirdTTSComponent

            comp = SunbirdTTSComponent(language=language, voice_id=voice_id, api_key=api_key)
            res = comp.run(
                Result(
                    segments=[Segment(start=0.0, end=2.0, text=text, language=language)],
                    source_language=language,
                    provenance={"consent_basis": consent_basis},
                )
            )
            if res.artifacts:
                from pathlib import Path
                return Path(res.artifacts[0]).read_bytes(), "audio/wav"

        elif model == "dummy":
            import tempfile
            from pathlib import Path

            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
                tmp_path = Path(tf.name)
            try:
                write_dummy_wav(tmp_path, duration_sec=max(1.0, len(text) * 0.08 / speed))
                audio_bytes = tmp_path.read_bytes()
            finally:
                tmp_path.unlink(missing_ok=True)
            return audio_bytes, "audio/wav"


        elif model in ("sherpa_mms", "sherpa_mms_tts"):
            from lingualdub.components.tts.sherpa_mms import SherpaMMSTTSComponent

            comp = SherpaMMSTTSComponent(language=language)
            res = comp.run(
                Result(
                    segments=[Segment(start=0.0, end=2.0, text=text, language=language)],
                    source_language=language,
                    provenance={"consent_basis": consent_basis},
                )
            )
            if res.artifacts:
                from pathlib import Path
                return Path(res.artifacts[0]).read_bytes(), "audio/wav"

        elif model in ("omnivoice", "omnivoice_gguf"):
            from lingualdub.components.tts.omnivoice import OmniVoiceTTSComponent

            ref_path = None
            if voice_pack:
                ref_path = voice_pack.extract_reference_audio()

            comp = OmniVoiceTTSComponent(ref_audio_path=ref_path, language=language)
            res = comp.run(
                Result(
                    segments=[Segment(start=0.0, end=2.0, text=text, language=language)],
                    source_language=language,
                    provenance={"consent_basis": consent_basis},
                )
            )
            if res.artifacts:
                from pathlib import Path
                return Path(res.artifacts[0]).read_bytes(), "audio/wav"

        # Fallback dummy
        dummy = DummyTTSComponent()
        fallback_res = dummy.degrade(Result(segments=[], source_language=language))
        from pathlib import Path
        return Path(fallback_res.artifacts[0]).read_bytes(), "audio/wav"

    def handle_list_voices(self, language: str | None = None) -> list[dict[str, Any]]:
        """
        List all available African voices (stored and preset).
        """
        voices: list[dict[str, Any]] = []

        # 1. Presets
        for p in list_presets(language=language):
            voices.append(p.to_dict())

        # 2. Custom stored voices
        for v in self.voice_store.list_voices(language=language):
            if v.voice_id not in [x["voice_id"] for x in voices]:
                voices.append(v.to_dict())

        return voices

    def handle_clone_voice(self, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Create a new VoicePack from uploaded reference audio and consent certificate.
        """
        name = payload["name"]
        audio_bytes = payload["audio_bytes"]
        language = payload.get("language", "lug")
        consent_basis = payload["consent_basis"]
        gender = payload.get("gender", "neutral")
        dialect = payload.get("dialect")
        tags = payload.get("tags", ["cloned"])

        pack = VoicePack.create(
            name=name,
            audio_path_or_bytes=audio_bytes,
            primary_language=language,
            consent_basis=consent_basis,
            gender=gender,
            dialect=dialect,
            style_tags=tags,
        )
        saved_path = self.voice_store.save(pack)
        return {
            "status": "ok",
            "voice_id": pack.voice_id,
            "name": pack.name,
            "path": str(saved_path),
        }

    def handle_system_probe(self) -> dict[str, Any]:
        """Query host hardware capabilities and quantization recommendation."""
        from lingualdub.engines.probe import detect_capabilities

        caps = detect_capabilities()
        return {
            "accelerator": caps.accelerator,
            "vram_mb": caps.vram_mb,
            "system_ram_mb": caps.system_ram_mb,
            "compute_class": caps.compute_class,
            "device_name": caps.device_name,
            "recommended_gguf_quant": caps.recommended_gguf_quant,
            "can_run_local_heavy": caps.can_run_local_heavy,
        }

    def handle_agent_converse(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Handle conversational voice turn with audio synthesis."""
        import base64

        from lingualdub.agent.converse import ConversationalVoiceAgent

        user_text = payload.get("text", "").strip()
        voice_id = payload.get("voice_id", "kigozi_lug")
        language = payload.get("language", "lug")

        agent = ConversationalVoiceAgent(voice_id=voice_id, language=language)
        chunks = list(agent.respond_stream(user_text=user_text))
        reply_text = agent.history[-1].text if agent.history else ""
        audio_data = b"".join(chunk.data for chunk in chunks)

        return {
            "reply_text": reply_text,
            "voice_id": voice_id,
            "language": language,
            "audio_base64": base64.b64encode(audio_data).decode("ascii"),
            "interrupted": agent.barge_in.is_interrupted,
            "turns_count": len(agent.history),
        }

    def handle_translate(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Translate text between African and international languages."""
        from lingualdub.components.translation.quantized_nllb import (
            QuantizedNLLBTranslationComponent,
        )
        from lingualdub.core.result import Result
        from lingualdub.core.segment import Segment

        text = payload.get("text", "").strip()
        src = payload.get("source_language", "eng")
        tgt = payload.get("target_language", "lug")
        if not text:
            raise ValueError("Text cannot be empty.")

        api_key = payload.get("api_key") or os.environ.get("SUNBIRD_API_KEY")

        # 1. Try real Sunbird AI Cloud Translation if API key is present
        if api_key:
            try:
                from lingualdub.engines.sunbird.client import SunbirdClient
                client = SunbirdClient(api_key=api_key)
                sunbird_res = client.translate(text=text, source_language=src, target_language=tgt)
                if isinstance(sunbird_res, dict) and "translated_text" in sunbird_res:
                    return {
                        "source_language": src,
                        "target_language": tgt,
                        "original_text": text,
                        "translated_text": sunbird_res["translated_text"],
                        "engine": "sunbird_cloud",
                    }
            except Exception as exc:
                logger.debug("Sunbird translation fallback: %s", exc)

        # 2. Try Local Quantized NLLB-200
        try:
            comp = QuantizedNLLBTranslationComponent(source_language=src, target_language=tgt)
            res = comp.run(
                Result(segments=[Segment(start=0.0, end=1.0, text=text, language=src)], source_language=src)
            )
            if res.segments and res.segments[0].text:
                return {
                    "source_language": src,
                    "target_language": tgt,
                    "original_text": text,
                    "translated_text": res.segments[0].text,
                    "engine": "quantized_nllb",
                }
        except Exception as exc:
            logger.debug("NLLB translation fallback: %s", exc)

        # 3. Authentic African Lexicon & Phrasebook Translation
        from lingualdub.languages.lexicon import translate_with_lexicon
        translated_text = translate_with_lexicon(text, source_language=src, target_language=tgt)

        return {
            "source_language": src,
            "target_language": tgt,
            "original_text": text,
            "translated_text": translated_text,
            "engine": "african_lexicon",
        }



    def handle_studio_master(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Master audio track to broadcast target loudness with soft saturation."""
        from lingualdub.studio.mastering import calculate_rms, normalize_loudness

        samples = payload.get("samples", [0.05, -0.05, 0.08, -0.08])
        target_rms = float(payload.get("target_rms", 0.1))
        initial_rms = calculate_rms(samples)
        mastered = normalize_loudness(samples, target_rms=target_rms)
        final_rms = calculate_rms(mastered)

        return {
            "initial_rms": initial_rms,
            "final_rms": final_rms,
            "target_rms": target_rms,
            "samples_count": len(samples),
        }

    def handle_list_models(self) -> list[dict[str, Any]]:
        """List all offline neural models and their download status."""
        from lingualdub.models.manager import ModelManager

        manager = ModelManager()
        return manager.list_models()

    def handle_pull_model(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Download model weights from Hugging Face."""
        from lingualdub.models.manager import ModelManager

        model_id = payload.get("model_id")
        if not model_id:
            raise ValueError("Field 'model_id' is required.")

        manager = ModelManager()
        path = manager.download(model_id)
        return {
            "status": "success",
            "model_id": model_id,
            "local_path": str(path),
        }

    def handle_remove_model(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Remove model weights from local cache."""
        from lingualdub.models.manager import ModelManager

        model_id = payload.get("model_id")
        if not model_id:
            raise ValueError("Field 'model_id' is required.")

        manager = ModelManager()
        deleted = manager.delete(model_id)
        return {
            "status": "success" if deleted else "not_found",
            "model_id": model_id,
            "deleted": deleted,
        }

