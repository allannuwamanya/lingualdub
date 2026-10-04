import React, { useState, useRef } from 'react';
import {
  Upload,
  FileAudio,
  Mic,
  Square,
  Play,
  Pause,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useMicRecorder } from './useMicRecorder';

interface ClonerAudioInputProps {
  audioFile: File | null;
  onAudioFileSelected: (file: File) => void;
  onClearAudioFile: () => void;
  audioPreviewUrl: string | null;
}

export default function ClonerAudioInput({
  audioFile,
  onAudioFileSelected,
  onClearAudioFile,
  audioPreviewUrl,
}: ClonerAudioInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const { isRecording, recordingSeconds, startRecording, stopRecording } =
    useMicRecorder(onAudioFileSelected);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('audio/') || file.name.endsWith('.wav') || file.name.endsWith('.mp3'))) {
      onAudioFileSelected(file);
    }
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => setIsPlayingPreview(true))
        .catch(() => {});
    }
  };

  return (
    <section
      aria-label="Reference Audio Speech Sample"
      className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6"
    >
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
        <span className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-300 text-base font-black flex items-center justify-center shrink-0">
          2
        </span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Reference Speech Sample (5–30 Seconds)
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
            Upload clean studio voice audio or record directly via microphone for ECAPA-TDNN extraction.
          </p>
        </div>
      </div>

      {/* ── Drag & Drop Box + Recording Option ── */}
      {!audioFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-white/10 bg-[#070b14] hover:border-white/20'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Upload className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 mb-7">
            <p className="text-lg sm:text-xl font-bold text-white">
              Drag and drop clean speech audio here, or browse files
            </p>
            <p className="text-sm sm:text-base text-slate-400">
              Supports WAV, MP3, AAC, FLAC, OGG (16 kHz or 44.1 kHz, single speaker)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* File Upload Button */}
            <label className="inline-flex items-center gap-2.5 h-13 px-7 bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 hover:text-white font-bold rounded-2xl text-base transition-colors cursor-pointer">
              <FileAudio className="w-5 h-5 text-indigo-400" />
              <span>Select Audio File</span>
              <input
                type="file"
                accept="audio/*,.wav,.mp3,.aac,.flac,.ogg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onAudioFileSelected(e.target.files[0]);
                  }
                }}
                className="sr-only"
              />
            </label>

            {/* Direct Microphone Recorder Button */}
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex items-center gap-2.5 h-13 px-7 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-base transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                <Mic className="w-5 h-5" />
                <span>Record via Mic</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2.5 h-13 px-7 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-base transition-all shadow-lg shadow-rose-600/30 cursor-pointer animate-pulse"
              >
                <Square className="w-5 h-5 fill-white" />
                <span>Stop Recording ({recordingSeconds}s)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Audio Verification Player (When File Loaded) ── */}
      {audioFile && audioPreviewUrl && (
        <div className="p-6 bg-[#070b14] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={togglePreviewPlay}
              className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={isPlayingPreview ? 'Pause reference preview' : 'Play reference preview'}
            >
              {isPlayingPreview ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 ml-0.5 fill-white" />
              )}
            </button>
            <div className="min-w-0">
              <p className="text-base font-extrabold text-white truncate max-w-sm">{audioFile.name}</p>
              <p className="text-sm text-slate-300 font-mono mt-0.5 font-medium">
                {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for ECAPA extraction
              </p>
            </div>
          </div>

          <audio
            ref={previewAudioRef}
            src={audioPreviewUrl}
            onEnded={() => setIsPlayingPreview(false)}
            onError={() => setIsPlayingPreview(false)}
            className="hidden"
          />

          <div className="flex items-center gap-3.5 w-full sm:w-auto justify-end">
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-2 shrink-0 bg-emerald-500/15 px-4 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4" /> Reference Verified
            </span>
            <button
              type="button"
              onClick={onClearAudioFile}
              className="w-12 h-12 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              title="Remove audio file and choose another"
              aria-label="Remove audio file"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
