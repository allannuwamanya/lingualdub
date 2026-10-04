import React from 'react';
import { Clock, Gauge, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DubbingTimingHUDProps {
  srcDuration: string;
  tgtDuration: string;
  srcSyllables: number;
  tgtSyllables: number;
  durationDiffSec: number;
  durationRatio: number;
  recommendedSpeed: string;
}

export default function DubbingTimingHUD({
  srcDuration,
  tgtDuration,
  srcSyllables,
  tgtSyllables,
  durationDiffSec,
  durationRatio,
  recommendedSpeed,
}: DubbingTimingHUDProps) {
  const isSyncGood = Math.abs(durationRatio) <= 10;
  const isSyncWarning = Math.abs(durationRatio) > 20;

  return (
    <section
      aria-label="Acoustic Syllable & Timing Alignment HUD"
      className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Acoustic Syllable & Timing Alignment HUD
          </h2>
        </div>
        <div className="flex items-center gap-3 text-sm font-mono flex-wrap">
          <span className="text-slate-300">
            Source: <strong className="text-white font-semibold">{srcDuration}s</strong> ({srcSyllables} syl)
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">
            Target: <strong className="text-indigo-300 font-semibold">{tgtDuration}s</strong> ({tgtSyllables} syl)
          </span>
          <span className="text-slate-600">•</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold font-mono ${
              isSyncGood
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-amber-500/15 text-amber-300'
            }`}
          >
            Delta: {durationRatio >= 0 ? `+${durationRatio}%` : `${durationRatio}%`} ({durationDiffSec >= 0 ? `+${durationDiffSec.toFixed(1)}s` : `${durationDiffSec.toFixed(1)}s`})
          </span>
        </div>
      </div>

      {/* Visual Timing Comparison Bars */}
      <div className="space-y-3.5 pt-2">
        {/* Source Timing Bar */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400 w-16 text-right shrink-0">Source</span>
          <div className="flex-1 bg-[#070b14] h-3.5 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-slate-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(10, (parseFloat(srcDuration) / 14) * 100))}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-300 w-12">{srcDuration}s</span>
        </div>

        {/* Target Timing Bar */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-indigo-400 w-16 text-right shrink-0">Target</span>
          <div className="flex-1 bg-[#070b14] h-3.5 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(10, (parseFloat(tgtDuration) / 14) * 100))}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-300 w-12">{tgtDuration}s</span>
        </div>
      </div>

      {/* Recommended Pacing & Warnings */}
      <div className="pt-4 border-t border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <Gauge className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Recommended TTS Pacing: <strong className="text-white font-mono">{recommendedSpeed}x</strong> to synchronize dialogue to exact video frames.
          </span>
        </div>
        {isSyncWarning ? (
          <div className="flex items-center gap-1.5 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Target text differs by &gt;20%. Calibrate phrasing or apply pacing.</span>
          </div>
        ) : isSyncGood ? (
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Optimal temporal alignment (&plusmn;10%). Ready for video dubbing.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
