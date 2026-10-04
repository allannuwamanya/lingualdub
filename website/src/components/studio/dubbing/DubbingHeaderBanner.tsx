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
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 sm:p-8 bg-[#101726] rounded-3xl shadow-xl">
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Film className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Dubbing Room & Timing Studio
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 tracking-wide">
              Syllable Alignment
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-300 mt-1.5 leading-relaxed">
            Translate spoken dialogue across African languages and align timing envelopes for precise video lip-sync.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onLoadSample}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer min-h-[42px] focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Load Standard Dialogue</span>
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 flex items-center gap-2 transition-all cursor-pointer min-h-[42px] focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>
    </header>
  );
}
