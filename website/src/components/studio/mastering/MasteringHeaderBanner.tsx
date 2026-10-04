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
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 sm:p-8 bg-[#101726] rounded-3xl shadow-xl">
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Sliders className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Audio Mastering & Loudness Rack
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 tracking-wide">
              EBU R128 Compliant
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-300 mt-1.5 leading-relaxed">
            Multi-band dynamic range compression, automatic dialogue ducking, and True-Peak limiting.
          </p>
        </div>
      </div>

      {/* A/B Bypass Button */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onToggleBypass}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer min-h-[42px] focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isBypass
              ? 'bg-amber-500/15 text-amber-300 font-bold ring-1 ring-amber-500/30'
              : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white'
          }`}
          title="Toggle between mastered audio and unprocessed original audio"
          aria-pressed={isBypass}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isBypass ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>{isBypass ? 'Bypass ON (Dry Signal)' : 'A/B Bypass Active (Wet Signal)'}</span>
        </button>
      </div>
    </header>
  );
}
