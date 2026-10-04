import React from 'react';
import { Layers, RotateCcw, Play, Pause, Download, Music2, Film } from 'lucide-react';
import { formatTime } from '../../../types/studio';

interface SpeechAudioMonitorProps {
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  estimatedDurationSec: string;
  audioTrackName: string;
  selectedVoice: string;
  selectedLang: string;
  speechText: string;
  togglePlayPause: () => void;
  replayAudio: () => void;
  seekAudio: (time: number) => void;
  navigate: (path: string) => void;
}

export default function SpeechAudioMonitor({
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  estimatedDurationSec,
  audioTrackName,
  selectedVoice,
  selectedLang,
  speechText,
  togglePlayPause,
  replayAudio,
  seekAudio,
  navigate,
}: SpeechAudioMonitorProps) {
  const effectiveDuration = duration > 0 ? duration : parseFloat(estimatedDurationSec) || 0;
  const progressPercent = effectiveDuration > 0 ? Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100)) : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (effectiveDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekAudio(ratio * effectiveDuration);
  };

  return (
    <div className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Acoustic Audio Monitor
          </h2>
        </div>
        <span className="text-sm font-mono font-semibold text-slate-300">
          {audioUrl ? 'Signal Ready' : 'Standby'}
        </span>
      </div>

      {/* Monitor Display Box */}
      <div className="p-7 bg-[#070b14] rounded-2xl space-y-6">
        <div className="flex items-center justify-between text-base text-slate-300">
          <span className="flex items-center gap-2.5 font-bold">
            <span
              className={`w-3 h-3 rounded-full ${
                isPlaying ? 'bg-indigo-400 animate-pulse' : audioUrl ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
            <span>
              {isPlaying ? 'Playing Audio Signal' : audioUrl ? audioTrackName || 'Voice Track Loaded' : 'Awaiting Synthesis'}
            </span>
          </span>
          <span className="font-mono text-sm text-slate-400">
            {audioUrl ? '16 kHz Mono PCM' : 'No Signal'}
          </span>
        </div>

        {/* Waveform Visualization */}
        <div className="h-32 flex items-center justify-between gap-1.5 px-5 py-3 bg-black/60 rounded-2xl overflow-hidden">
          {Array.from({ length: 56 }).map((_, i) => {
            const seed = Math.sin(i * 0.22) * 40 + Math.cos(i * 0.45) * 35 + 45;
            const barHeight = isPlaying ? Math.max(15, seed % 95) : audioUrl ? 26 : 10;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-indigo-500' : audioUrl ? 'bg-indigo-900/60' : 'bg-slate-800/60'
                }`}
                style={{
                  height: `${barHeight}%`,
                  opacity: isPlaying ? 0.95 : 0.45,
                }}
              />
            );
          })}
        </div>

        {/* Scrubbable Timeline */}
        <div className="space-y-2">
          <div
            onClick={handleProgressClick}
            className="h-3.5 sm:h-4 bg-white/[0.06] hover:bg-white/[0.1] rounded-full cursor-pointer relative overflow-hidden transition-colors"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm sm:text-base font-mono font-medium text-slate-300">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Player Transport Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={replayAudio}
              disabled={!audioUrl}
              className="w-13 h-13 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-30 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Replay from start"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              disabled={!audioUrl}
              className="h-13 sm:h-14 px-7 sm:px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer disabled:cursor-not-allowed"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play Audio</span>
                </>
              )}
            </button>
          </div>

          {/* Workflow Route Buttons */}
          {audioUrl && (
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={audioUrl}
                download={`lingualdub_${selectedVoice}_${selectedLang}.wav`}
                className="h-13 px-5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white text-sm font-bold flex items-center gap-2.5 transition-colors"
                title="Download audio WAV"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export WAV</span>
              </a>

              <button
                type="button"
                onClick={() => navigate('/mastering')}
                className="h-13 px-5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                title="Send to Mastering Rack for broadcast LUFS leveling"
              >
                <Music2 className="w-4 h-4 text-indigo-400" />
                <span>To Mastering</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/dubbing?lang=${selectedLang}&text=${encodeURIComponent(speechText)}`)}
                className="h-13 px-5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                title="Send to Lip-Sync Dubbing Room"
              >
                <Film className="w-4 h-4 text-indigo-400" />
                <span>To Dubbing</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
