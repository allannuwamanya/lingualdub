# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

"""
Command Line Interface (CLI) for LingualDub.

Supports running experiments, listing registered components, evaluating results,
and comparing experiment runs.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

import lingualdub as ld
from lingualdub.components.eval.metrics import (
    TemporalAlignmentEvaluator,
    TranslationEvaluator,
    WEREvaluator,
)
from lingualdub.pipeline.config_loader import ConfigLoader
from lingualdub.registry.manifest import ManifestScanner
from lingualdub.utils.comparison import compare_runs

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("lingualdub.cli")


def get_default_registry() -> ld.Registry:
    """Build and populate the default framework Registry."""
    registry = ld.Registry(conflict_policy=ld.ConflictPolicy.HIGHEST_VERSION)

    # Register built-in languages
    from lingualdub.languages.luganda import LUGANDA
    from lingualdub.languages.runyankole import RUNYANKOLE

    registry.register("language", "lug", LUGANDA, version="1.0.0")
    registry.register("language", "nyn", RUNYANKOLE, version="1.0.0")

    # Register built-in dummy/mock components
    from lingualdub.components.asr.dummy import DummyASRComponent
    from lingualdub.components.translation.dummy import DummyTranslationComponent
    from lingualdub.components.tts.dummy import DummyTTSComponent

    registry.register("component", "dummy_asr", DummyASRComponent, version="1.0.0")
    registry.register("component", "dummy_translator", DummyTranslationComponent, version="1.0.0")
    registry.register("component", "dummy_tts", DummyTTSComponent, version="1.0.0")

    # Register real adapters if available
    try:
        from lingualdub.components.asr.sunbird import SunbirdASRComponent

        registry.register("component", "sunbird_asr", SunbirdASRComponent, version="1.0.0")
    except Exception:
        pass

    try:
        from lingualdub.components.asr.whisper import WhisperASRComponent

        registry.register("component", "whisper_asr", WhisperASRComponent, version="1.0.0")
    except Exception:
        pass

    try:
        from lingualdub.components.asr.faster_whisper import FasterWhisperASRComponent

        registry.register(
            "component", "faster_whisper_asr", FasterWhisperASRComponent, version="1.0.0"
        )
    except Exception:
        pass

    try:
        from lingualdub.components.translation.sunbird import SunbirdTranslationComponent

        registry.register(
            "component", "sunbird_translator", SunbirdTranslationComponent, version="1.0.0"
        )
    except Exception:
        pass

    try:
        from lingualdub.components.translation.hf_translator import HuggingFaceTranslationComponent

        registry.register(
            "component", "hf_translator", HuggingFaceTranslationComponent, version="1.0.0"
        )
    except Exception:
        pass

    try:
        from lingualdub.components.translation.quantized_nllb import (
            QuantizedNLLBTranslationComponent,
        )

        registry.register(
            "component", "quantized_nllb", QuantizedNLLBTranslationComponent, version="1.0.0"
        )
    except Exception:
        pass

    try:
        from lingualdub.components.tts.mms_tts import MMSTTSComponent

        registry.register("component", "mms_tts", MMSTTSComponent, version="1.0.0")
    except Exception:
        pass

    try:
        from lingualdub.components.tts.sunbird import SunbirdTTSComponent

        registry.register("component", "sunbird_tts", SunbirdTTSComponent, version="1.0.0")
    except Exception:
        pass

    try:
        from lingualdub.components.tts.sherpa_mms import SherpaMMSTTSComponent

        registry.register("component", "sherpa_mms_tts", SherpaMMSTTSComponent, version="1.0.0")
    except Exception:
        pass

    try:
        from lingualdub.components.tts.omnivoice import OmniVoiceTTSComponent

        registry.register("component", "omnivoice_gguf", OmniVoiceTTSComponent, version="1.0.0")
    except Exception:
        pass

    # Register code-switch components
    from lingualdub.components.code_switch.dummy import DummyCodeSwitchComponent
    from lingualdub.components.code_switch.heuristic import HeuristicLIDComponent

    registry.register("component", "dummy_code_switch", DummyCodeSwitchComponent, version="1.0.0")
    registry.register("component", "heuristic_lid", HeuristicLIDComponent, version="1.0.0")

    try:
        from lingualdub.components.code_switch.neural_lid import NeuralLIDComponent

        registry.register("component", "neural_lid", NeuralLIDComponent, version="1.0.0")
    except Exception:
        pass

    try:
        from lingualdub.components.code_switch.blender import AudioBlendingComponent

        registry.register("component", "audio_blender", AudioBlendingComponent, version="1.0.0")
    except Exception:
        pass

    # Register alignment components (M4, M12)
    from lingualdub.components.alignment.duration import DurationModellingComponent
    from lingualdub.components.alignment.forced import DummyForcedAlignmentComponent

    registry.register(
        "component", "dummy_forced_aligner", DummyForcedAlignmentComponent, version="1.0.0"
    )
    registry.register("component", "duration_modeller", DurationModellingComponent, version="1.0.0")

    try:
        from lingualdub.components.alignment.neural import NeuralForcedAlignmentComponent

        registry.register(
            "component", "neural_forced_aligner", NeuralForcedAlignmentComponent, version="1.0.0"
        )
    except Exception:
        pass

    try:
        from lingualdub.components.alignment.time_stretch import AudioTimeStretchComponent

        registry.register(
            "component", "audio_time_stretcher", AudioTimeStretchComponent, version="1.0.0"
        )
    except Exception:
        pass

    # Register timing resource for forced aligner (M4.1)
    from lingualdub.resources.eval_sets import DUMMY_TIMING_RESOURCE

    registry.register("resource", "dummy_timing_resource", DUMMY_TIMING_RESOURCE, version="1.0.0")

    # Register evaluators
    registry.register("component", "wer_evaluator", WEREvaluator, version="1.0.0")
    registry.register("component", "translation_evaluator", TranslationEvaluator, version="1.0.0")
    registry.register(
        "component", "temporal_alignment_evaluator", TemporalAlignmentEvaluator, version="1.0.0"
    )

    try:
        from lingualdub.components.eval.flywheel import DataFlywheelComponent

        registry.register("component", "data_flywheel", DataFlywheelComponent, version="1.0.0")
    except Exception:
        pass

    # Register speaker components (M5)
    from lingualdub.components.eval.speaker_similarity import SpeakerSimilarityEvaluator
    from lingualdub.components.speaker.embedding import SpeakerEmbeddingComponent

    registry.register("component", "speaker_embedding", SpeakerEmbeddingComponent, version="1.0.0")
    registry.register(
        "component", "speaker_similarity_evaluator", SpeakerSimilarityEvaluator, version="1.0.0"
    )

    # Register speaker encoder resource
    from lingualdub.resources.eval_sets import SPEAKER_ENCODER_RESOURCE

    registry.register(
        "resource", "speaker_encoder_dummy_v1", SPEAKER_ENCODER_RESOURCE, version="1.0.0"
    )

    # Register voice cloning components (M6)
    from lingualdub.components.tts.voice_conditioned import VoiceConditionedTTSComponent

    registry.register(
        "component", "voice_conditioned_tts", VoiceConditionedTTSComponent, version="1.0.0"
    )

    # Register voice cloning resource
    from lingualdub.resources.eval_sets import VOICE_CLONING_RESOURCE

    registry.register("resource", "voice_cloning_dummy_v1", VOICE_CLONING_RESOURCE, version="1.0.0")

    # Register AV-sync evaluator + resources (M7)
    try:
        from lingualdub.components.eval.av_sync import AVSyncEvaluator

        registry.register("component", "av_sync_evaluator", AVSyncEvaluator, version="1.0.0")
    except Exception:
        pass

    from lingualdub.resources.eval_sets import SYNCNET_RESOURCE

    registry.register("resource", "syncnet_dummy_v1", SYNCNET_RESOURCE, version="1.0.0")

    # Register dialogue timing component (M7.2)
    try:
        from lingualdub.components.av_sync.dialogue_timing import DialogueTimingComponent

        registry.register("component", "dialogue_timing", DialogueTimingComponent, version="1.0.0")
    except Exception:
        pass

    # Register video merger + resources (M7.3)
    try:
        from lingualdub.components.av_sync.video_merger import VideoMergerComponent

        registry.register("component", "video_merger", VideoMergerComponent, version="1.0.0")
    except Exception:
        pass

    from lingualdub.resources.eval_sets import DUMMY_VIDEO_RESOURCE

    registry.register("resource", "dummy_video_lug_v1", DUMMY_VIDEO_RESOURCE, version="1.0.0")

    # Register Runyankole transfer component + eval resources (M8.2 / M8.3)
    try:
        from lingualdub.components.asr.runyankole import RunyankoleASRComponent

        registry.register("component", "runyankole_asr", RunyankoleASRComponent, version="1.0.0")
    except Exception:
        pass

    from lingualdub.resources.eval_sets import (
        RUNYANKOLE_ASR_EVAL_SET,
        RUNYANKOLE_ENG_PARALLEL_EVAL_SET,
    )

    registry.register("resource", "nyn_asr_eval_salt_v1", RUNYANKOLE_ASR_EVAL_SET, version="1.0.0")
    registry.register(
        "resource",
        "nyn_eng_parallel_eval_salt_v1",
        RUNYANKOLE_ENG_PARALLEL_EVAL_SET,
        version="1.0.0",
    )

    # Scan installed extension manifests (use NAMESPACED so built-ins + manifest coexist)
    # Temporarily allow NAMESPACED for scan to avoid discarding manifest entries on same version
    original_policy = registry.conflict_policy
    registry.conflict_policy = ld.ConflictPolicy.NAMESPACED
    scanner = ManifestScanner(registry)
    try:
        scanner.scan()
    except Exception as exc:
        logger.warning("Manifest scanning failed: %s", exc)
    finally:
        registry.conflict_policy = original_policy

    return registry


def cmd_experiment_run(args: argparse.Namespace) -> int:
    """Run a pipeline experiment from a configuration file."""
    config_path = Path(args.config)
    if not config_path.exists():
        logger.error("Configuration file not found: %s", config_path)
        return 1

    registry = get_default_registry()
    loader = ConfigLoader(registry)

    try:
        pipeline = loader.load_file(config_path)
    except Exception as exc:
        logger.error("Failed to load pipeline from %s: %s", config_path, exc)
        return 1

    logger.info(
        "Loaded pipeline: %r (stages: %s)", pipeline.name or "unnamed", pipeline.stage_names
    )

    # Prepare input resource or text
    # --input-video is additive; it injects source_video provenance for M7 AV-sync
    # pipelines. When both --input-audio and --input-video are given the audio
    # resource is primary but provenance carries source_video for dialogue_timing /
    # video_merger stages. When only --input-video is given a VIDEO resource is used.
    input_video_path = getattr(args, "input_video", None)
    input_obj: ld.Resource | ld.Result

    if args.input_audio and input_video_path:
        input_obj = ld.Resource(
            id="cli_audio_video_input",
            kind=ld.ResourceKind.SPEECH,
            language=pipeline.source_language,
            version="1.0.0",
            path=str(args.input_audio),
            provenance={
                "consent_basis": "user_provided",
                "source_video": str(input_video_path),
            },
        )
    elif args.input_audio:
        prov: dict = {"consent_basis": "user_provided"}
        # Note: input_video_path already handled in combined branch above; no dead video attach here
        input_obj = ld.Resource(
            id="cli_audio_input",
            kind=ld.ResourceKind.SPEECH,
            language=pipeline.source_language,
            version="1.0.0",
            path=str(args.input_audio),
            provenance=prov,
        )
    elif input_video_path:
        # No audio, but video + possibly sample_text — handle sample_text with video provenance
        if args.sample_text:
            prov = {
                "consent_basis": "user_provided",
                "source_video": str(input_video_path),
            }
            tmp = ld.Result(
                segments=[
                    ld.Segment(
                        start=0.0,
                        end=3.0,
                        text=args.sample_text,
                        language=pipeline.source_language,
                    )
                ],
                source_language=pipeline.source_language,
                provenance=prov,
                metadata={"source_video": str(input_video_path)},
            )
            input_obj = tmp
        else:
            input_obj = ld.Resource(
                id="cli_video_input",
                kind=ld.ResourceKind.VIDEO,
                language=pipeline.source_language,
                version="1.0.0",
                path=str(input_video_path),
                provenance={
                    "consent_basis": "user_provided",
                    "source_video": str(input_video_path),
                },
            )
    elif args.sample_text:
        input_obj = ld.Result(
            segments=[
                ld.Segment(
                    start=0.0,
                    end=3.0,
                    text=args.sample_text,
                    language=pipeline.source_language,
                )
            ],
            source_language=pipeline.source_language,
            provenance={"consent_basis": "user_provided"},
        )
    else:
        # Default placeholder — include synthetic consent for offline voice pipeline testing (flagged as synthetic)
        prov = {
            "source": "cli_default",
            "consent_basis": "research_evaluation",
            "consent_synthetic": True,
        }
        if input_video_path:
            prov["source_video"] = str(input_video_path)
        input_obj = ld.Resource(
            id="default_sample",
            kind=ld.ResourceKind.SPEECH,
            language=pipeline.source_language,
            version="1.0.0",
            provenance=prov,
        )

    executor = ld.PipelineExecutor(pipeline)
    try:
        result = executor.run(input_obj)
    except Exception as exc:
        logger.error("Pipeline execution failed: %s", exc)
        return 1

    logger.info("Pipeline completed with status: %s", result.status.value.upper())
    for s in result.segments:
        logger.info("  [%0.2fs -> %0.2fs] (%s): %s", s.start, s.end, s.language or "-", s.text)

    # Save output if output directory is provided (atomic writes)
    if args.output_dir:
        out_dir = Path(args.output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        if not out_dir.is_dir():
            logger.error("Output path is not a directory: %s", out_dir)
            return 1
        import contextlib
        import tempfile

        results_file = out_dir / "results.json"
        tmp_fd, tmp_path = tempfile.mkstemp(dir=str(out_dir), suffix=".json")
        try:
            with open(tmp_fd, "w", encoding="utf-8") as f:
                json.dump(result.to_dict(), f, indent=2)
            Path(tmp_path).replace(results_file)
        finally:
            with contextlib.suppress(FileNotFoundError):
                Path(tmp_path).unlink()
        logger.info("Saved result JSON to: %s", results_file)

        # Write experiment summary README
        summary_file = out_dir / "README.md"
        summary_md = f"""# Experiment Run: {pipeline.name or "Unnamed"}

- **Status**: `{result.status.value.upper()}`
- **Source Language**: `{pipeline.source_language}`
- **Target Language**: `{pipeline.target_language or "N/A"}`
- **Stages**: `{" -> ".join(pipeline.stage_names)}`
- **Segments Count**: {len(result.segments)}
- **Artifacts**: {len(result.artifacts)}

## Segment Outputs
"""
        for s in result.segments:
            summary_md += f"- **[{s.start:.2f}s - {s.end:.2f}s]** ({s.language}): {s.text}\n"

        tmp_fd2, tmp_path2 = tempfile.mkstemp(dir=str(out_dir), suffix=".md")
        try:
            with open(tmp_fd2, "w", encoding="utf-8") as f:
                f.write(summary_md)
            Path(tmp_path2).replace(summary_file)
        finally:
            with contextlib.suppress(FileNotFoundError):
                Path(tmp_path2).unlink()
        logger.info("Saved experiment summary to: %s", summary_file)

    return 0


def _extract_audio_from_video(video_path: Path, output_audio_path: Path) -> bool:
    """Extract audio from video file to 16kHz mono WAV using ffmpeg."""
    try:
        import subprocess

        output_audio_path.parent.mkdir(parents=True, exist_ok=True)
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-vn",
            "-acodec",
            "pcm_s16le",
            "-ar",
            "16000",
            "-ac",
            "1",
            str(output_audio_path),
        ]
        res = subprocess.run(cmd, capture_output=True, timeout=30)
        return res.returncode == 0 and output_audio_path.exists()
    except Exception:
        return False


def cmd_dub(args: argparse.Namespace) -> int:
    """Dub a video into a target language with audio-visual sync and subtitles."""
    video_path = Path(args.input_video)
    if not video_path.exists():
        logger.error("Input video file not found: %s", video_path)
        return 1

    registry = get_default_registry()
    loader = ConfigLoader(registry)

    import tempfile

    out_dir = (
        Path(args.output_dir)
        if args.output_dir
        else Path(tempfile.gettempdir()) / f"lingualdub_dub_{video_path.stem}"
    )
    out_dir.mkdir(parents=True, exist_ok=True)

    if getattr(args, "config", None):
        cfg_path = Path(args.config)
        if not cfg_path.exists():
            logger.error("Configuration file not found: %s", cfg_path)
            return 1
        try:
            pipeline = loader.load_file(cfg_path)
        except Exception as exc:
            logger.error("Failed to load pipeline from %s: %s", cfg_path, exc)
            return 1
    else:
        use_mock = getattr(args, "mock", False)

        def _is_reg(k: str) -> bool:
            try:
                registry.resolve("component", k)
                return True
            except Exception:
                return False

        asr_key = (
            "dummy_asr" if use_mock else ("whisper_asr" if _is_reg("whisper_asr") else "dummy_asr")
        )
        align_key = (
            "dummy_forced_aligner"
            if use_mock
            else (
                "neural_forced_aligner"
                if _is_reg("neural_forced_aligner")
                else "dummy_forced_aligner"
            )
        )
        trans_key = (
            "dummy_translator"
            if use_mock
            else (
                "hf_translator"
                if _is_reg("hf_translator")
                else ("sunbird_translator" if _is_reg("sunbird_translator") else "dummy_translator")
            )
        )
        tts_key = (
            "dummy_tts"
            if use_mock
            else (
                "voice_conditioned_tts"
                if _is_reg("voice_conditioned_tts")
                else ("mms_tts" if _is_reg("mms_tts") else "dummy_tts")
            )
        )

        stages = [
            {
                "kind": "component",
                "key": asr_key,
                "version": "1.0.0",
                "params": {"language": args.source},
            },
            {"kind": "component", "key": align_key, "version": "1.0.0"},
            {
                "kind": "component",
                "key": trans_key,
                "version": "1.0.0",
                "params": {"source_language": args.source, "target_language": args.target},
            },
            {"kind": "component", "key": "duration_modeller", "version": "1.0.0"},
            {"kind": "component", "key": "dialogue_timing", "version": "1.0.0"},
            {"kind": "component", "key": tts_key, "version": "1.0.0"},
            {"kind": "component", "key": "video_merger", "version": "1.0.0"},
        ]

        pipeline_def = {
            "name": f"dub_{args.source}_to_{args.target}",
            "source_language": args.source,
            "target_language": args.target,
            "on_stage_failure": "degrade",
            "stages": stages,
        }

        try:
            pipeline = loader.load_dict(pipeline_def)
        except Exception as exc:
            logger.error("Failed to assemble default dubbing pipeline: %s", exc)
            return 1

    logger.info(
        "Dubbing video %s [%s -> %s] (pipeline: %s, stages: %s)",
        video_path.name,
        pipeline.source_language,
        pipeline.target_language or "N/A",
        pipeline.name or "unnamed",
        pipeline.stage_names,
    )

    # Extract audio or prepare input resource
    extracted_audio = out_dir / f"{video_path.stem}_audio.wav"
    audio_extracted = _extract_audio_from_video(video_path, extracted_audio)

    input_path = str(extracted_audio.absolute()) if audio_extracted else str(video_path.absolute())
    input_kind = ld.ResourceKind.SPEECH if audio_extracted else ld.ResourceKind.VIDEO

    input_obj = ld.Resource(
        id=f"dub_input_{video_path.stem}",
        kind=input_kind,
        language=pipeline.source_language,
        version="1.0.0",
        path=input_path,
        provenance={
            "consent_basis": "user_provided",
            "source_video": str(video_path.absolute()),
        },
    )

    executor = ld.PipelineExecutor(pipeline)
    try:
        result = executor.run(input_obj)
    except Exception as exc:
        logger.error("Dubbing execution failed: %s", exc)
        return 1

    logger.info("Dubbing completed with status: %s", result.status.value.upper())
    for s in result.segments:
        logger.info("  [%0.2fs -> %0.2fs] (%s): %s", s.start, s.end, s.language or "-", s.text)

    # Locate outputs
    dubbed_video = None
    subtitles_file = None
    for art in result.artifacts:
        if isinstance(art, str):
            if art.endswith(".mp4"):
                dubbed_video = art
            elif art.endswith(".srt"):
                subtitles_file = art

    if dubbed_video:
        logger.info("✓ Dubbed video generated: %s", dubbed_video)
    if subtitles_file:
        logger.info("✓ Subtitles generated: %s", subtitles_file)

    # Save results json
    results_file = out_dir / "results.json"
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(result.to_dict(), f, indent=2)
    logger.info("Results saved to: %s", results_file)

    return 0


def cmd_registry_list(args: argparse.Namespace) -> int:
    """List registered framework items."""
    registry = get_default_registry()
    kinds = [args.kind] if args.kind else ["language", "component", "resource"]
    for kind in kinds:
        items = registry.list(kind)
        print(f"\n[{kind.upper()}S] ({len(items)} registered):")
        for key, ver in items:
            print(f"  - {key:<30} (v{ver})")
    return 0


def cmd_compare(args: argparse.Namespace) -> int:
    """Compare two experiment results."""
    try:
        res = compare_runs(args.baseline, args.candidate)
        print(json.dumps(res, indent=2))
        return 0
    except Exception as exc:
        logger.error("Comparison failed: %s", exc)
        return 1


def cmd_serve(args: argparse.Namespace) -> int:
    """Start the OpenAI & ElevenLabs-compatible African voice HTTP server."""
    from lingualdub.api.server import create_server

    server = create_server(host=args.host, port=args.port)
    logger.info("Starting LingualDub Voice AI server on http://%s:%d", args.host, args.port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Stopping LingualDub server...")
        server.server_close()
    return 0


def cmd_mcp(args: argparse.Namespace) -> int:
    """Start the Model Context Protocol (MCP) stdio server for AI agents."""
    from lingualdub.api.mcp import MCPServer

    logger.info("Starting LingualDub MCP stdio server...")
    mcp = MCPServer()
    mcp.run_stdio()
    return 0


def cmd_models(args: argparse.Namespace) -> int:
    """Manage offline neural model weights (Sherpa MMS, NLLB-200, Faster-Whisper, OmniVoice)."""
    from lingualdub.models.manager import ModelManager

    manager = ModelManager()
    sub = getattr(args, "models_subcommand", None)

    if sub == "list":
        models = manager.list_models(
            family=getattr(args, "family", None),
            task=getattr(args, "task", None),
        )
        print(f"{'MODEL ID':<20} {'NAME':<36} {'TASK':<12} {'SIZE':<10} {'STATUS':<14}")
        print("-" * 95)
        for m in models:
            status = "DOWNLOADED" if m["is_downloaded"] else "AVAILABLE"
            size_str = f"{m['size_mb']:.0f} MB"
            print(f"{m['model_id']:<20} {m['name'][:34]:<36} {m['task']:<12} {size_str:<10} {status:<14}")
        return 0

    elif sub == "pull":
        model_id = args.model
        if getattr(args, "lang", None) and model_id in ("sherpa_mms", "mms"):
            model_id = f"sherpa_mms_{args.lang.lower()}"

        print(f"Pulling model weights for '{model_id}' from Hugging Face...")
        try:
            path = manager.download(model_id)
            print(f"Successfully downloaded '{model_id}' to: {path}")
            return 0
        except Exception as exc:
            logger.error("Failed to pull model %s: %s", model_id, exc)
            print(f"Error: {exc}")
            return 1

    elif sub == "remove":
        model_id = args.model
        if getattr(args, "lang", None) and model_id in ("sherpa_mms", "mms"):
            model_id = f"sherpa_mms_{args.lang.lower()}"

        deleted = manager.delete(model_id)
        if deleted:
            print(f"Successfully deleted cache for '{model_id}'.")
            return 0
        else:
            print(f"Model '{model_id}' was not found in cache.")
            return 1

    elif sub == "path":
        model_id = args.model
        if getattr(args, "lang", None) and model_id in ("sherpa_mms", "mms"):
            model_id = f"sherpa_mms_{args.lang.lower()}"

        p = manager.get_model_path(model_id)
        if p:
            print(str(p))
            return 0
        else:
            print(f"Model '{model_id}' is not downloaded.")
            return 1

    print("Use: lingualdub models [list|pull|remove|path] --help")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="lingualdub",
        description="LingualDub — Speech-AI Framework for Low-Resource Languages",
    )
    subparsers = parser.add_subparsers(dest="subcommand", help="Available subcommands")

    # lingualdub dub ...
    dub_parser = subparsers.add_parser(
        "dub", help="Dub a video into a target language with audio-visual sync and subtitles"
    )
    dub_parser.add_argument("--input-video", "-i", required=True, help="Path to input video file")
    dub_parser.add_argument(
        "--source", "-s", default="eng", help="Source language code (e.g. eng, lug; default: eng)"
    )
    dub_parser.add_argument(
        "--target",
        "-t",
        default="lug",
        help="Target language code (e.g. lug, nyn, eng; default: lug)",
    )
    dub_parser.add_argument(
        "--output-dir", "-o", help="Output directory to save results, video, and subtitles"
    )
    dub_parser.add_argument(
        "--mock",
        "--fast",
        action="store_true",
        dest="mock",
        help="Use lightweight mock components for fast testing",
    )
    dub_parser.add_argument(
        "--config", "-c", help="Optional pipeline config YAML to override default stages"
    )

    # lingualdub experiment run ...
    exp_parser = subparsers.add_parser("experiment", help="Experiment commands")
    exp_sub = exp_parser.add_subparsers(dest="exp_subcommand")
    run_parser = exp_sub.add_parser("run", help="Run a pipeline experiment from config")
    run_parser.add_argument("config", help="Path to pipeline configuration YAML/JSON")
    run_parser.add_argument("--input-audio", "-i", help="Path to input audio file")
    run_parser.add_argument(
        "--input-video", help="Path to input video file (source video for AV-sync, M7)"
    )
    run_parser.add_argument(
        "--sample-text", "-t", help="Sample text for direct text pipeline tests"
    )
    run_parser.add_argument(
        "--output-dir", "-o", help="Output directory to save results and artifacts"
    )

    # lingualdub registry ...
    reg_parser = subparsers.add_parser("registry", help="Registry inspection")
    reg_sub = reg_parser.add_subparsers(dest="reg_subcommand")
    list_parser = reg_sub.add_parser("list", help="List registered components and languages")
    list_parser.add_argument(
        "--kind", "-k", choices=["language", "component", "resource"], help="Filter by kind"
    )

    # lingualdub compare ...
    cmp_parser = subparsers.add_parser("compare", help="Compare two experiment results")
    cmp_parser.add_argument("--baseline", "-b", required=True, help="Path to baseline results.json")
    cmp_parser.add_argument(
        "--candidate", "-c", required=True, help="Path to candidate results.json"
    )

    # lingualdub serve ...
    serve_parser = subparsers.add_parser(
        "serve", help="Start the OpenAI & ElevenLabs-compatible African voice HTTP server"
    )
    serve_parser.add_argument("--host", default="127.0.0.1", help="Host address (default: 127.0.0.1)")
    serve_parser.add_argument("--port", "-p", type=int, default=8000, help="Port (default: 8000)")

    # lingualdub mcp ...
    subparsers.add_parser(
        "mcp", help="Start the Model Context Protocol (MCP) server for AI coding agents"
    )

    # lingualdub models ...
    models_parser = subparsers.add_parser(
        "models", help="Manage offline neural models and weights"
    )
    models_sub = models_parser.add_subparsers(dest="models_subcommand")

    # lingualdub models list
    list_m_parser = models_sub.add_parser("list", help="List available and downloaded models")
    list_m_parser.add_argument(
        "--family", "-f", help="Filter by family (sherpa_mms, ct2_nllb, faster_whisper, omnivoice)"
    )
    list_m_parser.add_argument(
        "--task", "-t", help="Filter by task (tts, translation, asr, voice_clone)"
    )

    # lingualdub models pull <model> [--lang <lang>]
    pull_parser = models_sub.add_parser("pull", help="Download model weights from Hugging Face")
    pull_parser.add_argument(
        "model", help="Model ID (e.g. sherpa_mms_lug, ct2_nllb, whisper_tiny) or family"
    )
    pull_parser.add_argument("--lang", "-l", help="Language code if pulling per-language model")

    # lingualdub models remove <model> [--lang <lang>]
    rm_parser = models_sub.add_parser("remove", help="Remove downloaded model from local cache")
    rm_parser.add_argument("model", help="Model ID to remove")
    rm_parser.add_argument("--lang", "-l", help="Language code if per-language model")

    # lingualdub models path <model> [--lang <lang>]
    path_parser = models_sub.add_parser("path", help="Print local cache path for a downloaded model")
    path_parser.add_argument("model", help="Model ID")
    path_parser.add_argument("--lang", "-l", help="Language code if per-language model")

    args = parser.parse_args(argv)
    if args.subcommand == "dub":
        return cmd_dub(args)
    elif args.subcommand == "experiment" and args.exp_subcommand == "run":
        return cmd_experiment_run(args)
    elif args.subcommand == "registry" and args.reg_subcommand == "list":
        return cmd_registry_list(args)
    elif args.subcommand == "compare":
        return cmd_compare(args)
    elif args.subcommand == "serve":
        return cmd_serve(args)
    elif args.subcommand == "mcp":
        return cmd_mcp(args)
    elif args.subcommand == "models":
        return cmd_models(args)
    else:
        parser.print_help()
        return 0


if __name__ == "__main__":
    sys.exit(main())
