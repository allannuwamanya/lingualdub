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
  Volume2,
} from 'lucide-react';

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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.name.endsWith('.wav') || file.name.endsWith('.mp3')) {
        onAudioFileSelected(file);
      }
    }
  };

  // Live Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], `mic_reference_${Date.now()}.wav`, {
          type: 'audio/wav',
        });
        onAudioFileSelected(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Could not access microphone. Please check browser permissions or use file upload.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
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
      className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5"
    >
      <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4">
        <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-300 text-sm font-bold flex items-center justify-center shrink-0">
          2
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Reference Speech Sample (5–30 Seconds)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
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
          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-white/10 bg-[#070b14] hover:border-white/20'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-1 mb-6">
            <p className="text-base font-semibold text-white">
              Drag and drop clean speech audio here, or browse files
            </p>
            <p className="text-sm text-slate-400">
              Supports WAV, MP3, AAC, FLAC, OGG (16 kHz or 44.1 kHz, single speaker)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* File Upload Button */}
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 font-semibold rounded-xl text-sm transition-colors cursor-pointer min-h-[44px]">
              <FileAudio className="w-4 h-4 text-indigo-400" />
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer min-h-[44px]"
              >
                <Mic className="w-4 h-4" />
                <span>Record via Mic</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-rose-600/30 cursor-pointer animate-pulse min-h-[44px]"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Recording ({recordingSeconds}s)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Audio Verification Player (When File Loaded) ── */}
      {audioFile && audioPreviewUrl && (
        <div className="p-5 bg-[#070b14] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={togglePreviewPlay}
              className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={isPlayingPreview ? 'Pause reference preview' : 'Play reference preview'}
            >
              {isPlayingPreview ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 ml-0.5 fill-white" />
              )}
            </button>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate max-w-xs">{audioFile.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
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

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 shrink-0 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" /> Reference Verified
            </span>
            <button
              type="button"
              onClick={onClearAudioFile}
              className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              title="Remove audio file and choose another"
              aria-label="Remove audio file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
