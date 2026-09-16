# Milestone 10: Cross-Lingual Voice Retention

## The Challenge
When dubbing from a low-resource language (e.g., Luganda) to a high-resource language (e.g., English), standard Text-to-Speech (TTS) models use a generic, synthesized voice. This breaks the immersion and destroys the original speaker's emotional delivery, timbre, and cadence. Retaining the voice identity across the language barrier is known as "Cross-Lingual Voice Cloning."

## Proposed Architecture

1. **SpeakerEncoderComponent**
   - **Role**: Extract a language-agnostic neural embedding (a vector of numbers) representing the speaker's vocal tract and style from the source audio.
   - **Implementation**: Utilize SpeechBrain's `spkrec-ecapa-voxceleb` model. It extracts robust X-vectors (embeddings) from short audio clips, regardless of the language spoken.

2. **VoiceConditionedTTSComponent Enhancement**
   - **Role**: Synthesize the target language text while conditioning the acoustic generation on the extracted speaker embedding.
   - **Implementation**: Fully activate the `Coqui XTTS-v2` integration. XTTS allows zero-shot voice cloning by accepting a 3-second audio prompt (or embedding) and generating speech in multiple languages with the same voice.

## Implementation Steps
- [ ] Create `SpeakerEncoderComponent` in `lingualdub/components/speaker/encoder.py`.
- [ ] Add `speechbrain` to dependencies.
- [ ] Update `VoiceConditionedTTSComponent` to natively accept the ECAPA-TDNN embedding and pass it to XTTS.
- [ ] Create an evaluation pipeline using `SpeakerSimilarityEvaluator` to measure the cosine distance between the original Luganda voice embedding and the synthesized English voice embedding.
