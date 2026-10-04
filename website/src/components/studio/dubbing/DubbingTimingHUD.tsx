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
      className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-indigo-400" />
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
            Acoustic Syllable & Timing Alignment HUD
          </h2>
        </div>
        <div className="flex items-center gap-3.5 text-base font-mono flex-wrap">
          <span className="text-slate-300">
            Source: <strong className="text-white font-bold">{srcDuration}s</strong> ({srcSyllables} syl)
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">
            Target: <strong className="text-indigo-300 font-bold">{tgtDuration}s</strong> ({tgtSyllables} syl)
          </span>
          <span className="text-slate-600">•</span>
          <span
            className={`px-3.5 py-1 rounded-full text-sm font-bold font-mono ${
              isSyncGood
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            Delta: {durationRatio >= 0 ? `+${durationRatio}%` : `${durationRatio}%`} ({durationDiffSec >= 0 ? `+${durationDiffSec.toFixed(1)}s` : `${durationDiffSec.toFixed(1)}s`})
          </span>
        </div>
      </div>

      {/* Visual Timing Comparison Bars */}
      <div className="space-y-4 pt-1">
        {/* Source Bar */}
        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-300 mb-1.5">
            <span>Source Spoken Timeline (Reference)</span>
            <span className="font-mono text-slate-400">{srcDuration}s</span>
          </div>
          <div className="h-4 bg-[#070b14] rounded-full overflow-hidden p-0.5">
            <div className="h-full bg-slate-500 rounded-full w-full" />
          </div>
        </div>

        {/* Target Bar */}
        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-300 mb-1.5">
            <span>Target Spoken Timeline (Dubbed)</span>
            <span className="font-mono text-indigo-300 font-bold">{tgtDuration}s</span>
          </div>
          <div className="h-4 bg-[#070b14] rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isSyncGood
                  ? 'bg-emerald-500'
                  : isSyncWarning
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    15,
                    parseFloat(srcDuration) > 0
                      ? (parseFloat(tgtDuration) / parseFloat(srcDuration)) * 100
                      : 100
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Sync Advice Notice */}
      <div className="p-5 rounded-2xl bg-[#070b14] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-base font-medium">
        <div className="flex items-center gap-3">
          {isSyncGood ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="text-slate-200">
            {isSyncGood
              ? 'Excellent timing parity. Syllable count fits natural dialogue cadence without noticeable drift.'
              : isSyncWarning
              ? 'Timing drift exceeds 20%. Consider shortening phrasing or adjusting pacing speed in Speech Lab.'
              : 'Moderate timing deviation. Pacing adjustment can achieve seamless synchronization.'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-sm font-mono shrink-0 bg-white/[0.06] px-4 py-2 rounded-xl text-slate-200">
          <Gauge className="w-4 h-4 text-indigo-400" />
          <span>Recommended Speed: <strong className="text-indigo-400 font-bold">{recommendedSpeed}x</strong></span>
        </div>
      </div>
    </section>
  );
}
