# Milestone 11: Seamless Code-Switching TTS

## The Challenge
Code-switching (e.g., mixing Luganda and English in a single sentence) is incredibly common. Standard TTS models are monolingual. If you pass "Ndi busy today" to a Luganda TTS, it will mispronounce "busy today" using Luganda phonetic rules. If you pass it to an English TTS, it will butcher "Ndi". 

## Proposed Architecture

1. **Granular Language Routing**
   - **Role**: Leverage the newly built `NeuralLIDComponent` to chunk sentences into language-homogeneous sub-segments.
   - **Implementation**: If a sentence has 3 words in Luganda and 2 in English, split it. Send the Luganda words to the `SunbirdTTS` model and the English words to the `XTTS` model.

2. **Audio Cross-Fading (Prosody Preservation)**
   - **Role**: Prevent jarring cuts between the two TTS models.
   - **Implementation**: Create an `AudioBlendingComponent` that uses `pydub` or `torchaudio` to apply a 50ms cross-fade between the generated audio chunks.
   - **Advanced**: Use a shared phonological space (International Phonetic Alphabet) so a single multi-lingual model can handle the transition without routing to different models, ensuring the pitch and speaking rate remain constant.

## Implementation Steps
- [ ] Update the `PipelineExecutor` to support sub-segment routing (passing fragments of a sentence to different components based on `segment.language`).
- [ ] Create `AudioBlendingComponent` to stitch the synthesized chunks back together.
- [ ] Build a test suite with heavy "Luglish" (Luganda-English) sentences to verify prosody.
