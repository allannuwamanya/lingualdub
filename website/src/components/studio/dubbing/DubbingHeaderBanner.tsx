import React from 'react';
import { Film, Sparkles, Trash2 } from 'lucide-react';

interface DubbingHeaderBannerProps {
  onLoadSample: () => void;
  onClearAll: () => void;
}

export default function DubbingHeaderBanner({
  onLoadSample,
  onClearAll,
}: DubbingHeaderBannerProps) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 sm:p-9 bg-[#101726] rounded-3xl shadow-xl">
      <div className="flex items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Film className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Dubbing Room & Timing Studio
            </h1>
            <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-indigo-500/15 text-indigo-300 uppercase tracking-wider">
              Syllable Alignment
            </span>
          </div>
          <p className="text-base sm:text-lg text-slate-300 mt-2 leading-relaxed max-w-3xl">
            Translate spoken dialogue across African languages and align timing envelopes for precise video lip-sync.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3.5 shrink-0">
        <button
          type="button"
          onClick={onLoadSample}
          className="h-12 px-5 rounded-2xl text-sm font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 hover:text-white flex items-center gap-2.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Load Standard Dialogue</span>
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className="h-12 px-5 rounded-2xl text-sm font-bold bg-[#070b14] hover:bg-rose-500/15 text-slate-300 hover:text-rose-400 flex items-center gap-2.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>
    </header>
  );
}
