import React from 'react';
import { Zap, Play, Pause, RefreshCw } from 'lucide-react';

interface MasteringControlsCardProps {
  targetLufs: number;
  onTargetLufsChange: (val: number) => void;
  duckRatio: number;
  onDuckRatioChange: (val: number) => void;
  softClip: boolean;
  onSoftClipChange: (val: boolean) => void;
  highPass80Hz: boolean;
  onHighPass80HzChange: (val: boolean) => void;
  isProcessing: boolean;
  onRunMastering: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  hasAudio: boolean;
}

export default function MasteringControlsCard({
  targetLufs,
  onTargetLufsChange,
  duckRatio,
  onDuckRatioChange,
  softClip,
  onSoftClipChange,
  highPass80Hz,
  onHighPass80HzChange,
  isProcessing,
  onRunMastering,
  isPlaying,
  onTogglePlay,
  hasAudio,
}: MasteringControlsCardProps) {
  return (
    <div className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-7">
      {/* ── Target Loudness Slider ── */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-base mb-1">
          <label htmlFor="target-lufs-slider" className="font-bold text-slate-200">
            Integrated Target Loudness
          </label>
          <span className="font-mono text-indigo-300 font-extrabold px-3.5 py-1.5 bg-[#070b14] rounded-xl text-base">
            {targetLufs} LUFS
          </span>
        </div>
        <input
          id="target-lufs-slider"
          type="range"
          min="-24"
          max="-6"
          value={targetLufs}
          onChange={(e) => onTargetLufsChange(parseInt(e.target.value))}
          className="w-full h-3 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Target Loudness in LUFS"
        />
        <div className="flex justify-between text-sm font-mono text-slate-400">
          <span>-24 LUFS (Cinema)</span>
          <span>-16 LUFS (Podcast)</span>
          <span>-14 LUFS (Streaming)</span>
          <span>-6 LUFS (Club Max)</span>
        </div>
      </div>

      {/* ── Ducking Attenuation Slider ── */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-base mb-1">
          <label htmlFor="duck-ratio-slider" className="font-bold text-slate-200">
            Dialogue Ducking Attenuation
          </label>
          <span className="font-mono text-indigo-300 font-extrabold px-3.5 py-1.5 bg-[#070b14] rounded-xl text-base">
            {duckRatio} dB
          </span>
        </div>
        <input
          id="duck-ratio-slider"
          type="range"
          min="-24"
          max="-3"
          value={duckRatio}
          onChange={(e) => onDuckRatioChange(parseInt(e.target.value))}
          className="w-full h-3 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Dialogue Ducking Attenuation in dB"
        />
        <div className="flex justify-between text-sm font-mono text-slate-400">
          <span>-24 dB (Heavy Duck)</span>
          <span>-12 dB (Broadcast Standard)</span>
          <span>-3 dB (Subtle Music)</span>
        </div>
      </div>

      {/* ── DSP Switches ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <label className="flex items-start gap-4 p-5 bg-[#070b14] hover:bg-[#0c1220] rounded-2xl cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={softClip}
            onChange={(e) => onSoftClipChange(e.target.checked)}
            className="accent-indigo-500 w-5 h-5 mt-0.5 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
          <div>
            <span className="font-bold text-white block text-base">
              True-Peak Soft Clipping
            </span>
            <span className="text-slate-400 text-sm mt-1 block leading-relaxed">
              Analog-modeled saturation without digital clipping
            </span>
          </div>
        </label>

        <label className="flex items-start gap-4 p-5 bg-[#070b14] hover:bg-[#0c1220] rounded-2xl cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={highPass80Hz}
            onChange={(e) => onHighPass80HzChange(e.target.checked)}
            className="accent-indigo-500 w-5 h-5 mt-0.5 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
          <div>
            <span className="font-bold text-white block text-base">
              80Hz African Field De-Rumble
            </span>
            <span className="text-slate-400 text-sm mt-1 block leading-relaxed">
              Removes low-frequency aircon & street rumble
            </span>
          </div>
        </label>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
        <button
          type="button"
          onClick={onRunMastering}
          disabled={isProcessing}
          className="flex-1 h-16 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-2xl text-lg flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/25 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Mastering Track...</span>
            </>
          ) : (
            <>
              <Zap className="w-6 h-6" />
              <span>Apply DSP Mastering Chain</span>
            </>
          )}
        </button>

        {hasAudio && (
          <button
            type="button"
            onClick={onTogglePlay}
            className="h-16 px-7 bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 hover:text-white font-bold rounded-2xl text-base flex items-center justify-center gap-2.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 text-indigo-400 fill-current" />
                <span>Pause Monitor</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 text-indigo-400 fill-current" />
                <span>Audition Signal</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
