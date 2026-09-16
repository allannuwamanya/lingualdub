# Milestone 12: Duration-Constrained TTS (Lip Syncing)

## The Challenge
When a video is dubbed, the translated text rarely matches the exact duration of the original speech. If a Luganda phrase takes 3 seconds, but the English translation takes 5 seconds, the resulting video will have completely misaligned audio and lip movements, ruining the viewing experience.

## Proposed Architecture

1. **Target Duration Extraction**
   - **Role**: Use the `NeuralForcedAlignmentComponent` to get the exact start and end time of the original phrase.
   - **Implementation**: Store this duration as `target_duration` in the segment metadata.

2. **DurationModellingComponent**
   - **Role**: Force the TTS to match the `target_duration`.
   - **Implementation**: 
     - **Strategy A (Time-Stretching)**: Use `torchaudio.functional.phase_vocoder` or `sox` to speed up or slow down the synthesized audio without changing the pitch.
     - **Strategy B (Pacing Tokens)**: Use advanced TTS models that accept duration embeddings or pacing tokens to naturally speak faster or slower.

## Implementation Steps
- [ ] Create `DurationModellingComponent` in `lingualdub/components/alignment/duration.py`.
- [ ] Implement a phase vocoder (time-stretching) fallback for traditional TTS outputs.
- [ ] Implement a "compression ratio" check: if the required speedup is > 1.5x, fallback to truncating or summarising the translation to prevent chipmunk voices.
