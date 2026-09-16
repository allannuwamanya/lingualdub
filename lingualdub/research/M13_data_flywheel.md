# Milestone 13: Data Flywheel Evaluator

## The Challenge
Low-resource languages like Runyankole suffer from a severe lack of parallel audio-text data. Standard dubbing pipelines just consume data. LingualDub can be uniquely positioned to *generate* data, turning every pipeline run into an opportunity to improve future models.

## Proposed Architecture

1. **Confidence Thresholding**
   - **Role**: Detect when a model struggles with a segment.
   - **Implementation**: ASR and Translation components output a `confidence` score (0.0 to 1.0). If confidence is below a threshold (e.g., < 0.60), flag the segment.

2. **DataFlywheelComponent**
   - **Role**: Export low-confidence segments into a structured dataset format for human review.
   - **Implementation**: Create a component that acts at the end of the pipeline. It reads all flagged segments, clips the original audio using `ffmpeg`, and outputs a JSONL file containing the audio path, the suspected text, the translation, and the confidence score.

3. **Community Loop**
   - **Role**: This JSONL file can be uploaded to platforms like HuggingFace or given to communities (like Sunbird AI or Masakhane) to manually correct, creating high-quality, hard-example training data.

## Implementation Steps
- [ ] Create `DataFlywheelComponent` in `lingualdub/components/eval/flywheel.py`.
- [ ] Add configuration for `confidence_threshold` and `export_dir`.
- [ ] Implement audio snipping using `torchaudio` to save just the 2-5 second flagged segment.
