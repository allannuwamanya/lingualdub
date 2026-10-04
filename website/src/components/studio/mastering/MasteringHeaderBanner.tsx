import React from 'react';
import { Sliders, RotateCcw } from 'lucide-react';

interface MasteringHeaderBannerProps {
  isBypass: boolean;
  onToggleBypass: () => void;
}

export default function MasteringHeaderBanner({
  isBypass,
  onToggleBypass,
}: MasteringHeaderBannerProps) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 sm:p-9 bg-[#101726] rounded-3xl shadow-xl">
      <div className="flex items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Sliders className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Audio Mastering & Loudness Rack
            </h1>
            <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-indigo-500/15 text-indigo-300 uppercase tracking-wider">
              EBU R128 Compliant
            </span>
          </div>
          <p className="text-base sm:text-lg text-slate-300 mt-2 leading-relaxed max-w-3xl">
            Multi-band dynamic range compression, automatic dialogue ducking, and True-Peak limiting calibrated for African broadcast standards.
          </p>
        </div>
      </div>

      {/* A/B Bypass Button */}
      <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
        <button
          type="button"
          onClick={onToggleBypass}
          className={`h-12 px-5 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isBypass
              ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40 shadow-md'
              : 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white'
          }`}
          title="Toggle between mastered audio and unprocessed original audio"
          aria-pressed={isBypass}
        >
          <RotateCcw className={`w-4 h-4 ${isBypass ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>{isBypass ? 'Bypass ON (Dry Signal)' : 'A/B Bypass Active (Wet Signal)'}</span>
        </button>
      </div>
    </header>
  );
}
