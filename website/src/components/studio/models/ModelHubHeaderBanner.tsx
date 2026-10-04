import React from 'react';
import { HardDrive, RefreshCw } from 'lucide-react';

interface ModelHubHeaderBannerProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function ModelHubHeaderBanner({
  onRefresh,
  isRefreshing,
}: ModelHubHeaderBannerProps) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 sm:p-9 bg-[#101726] rounded-3xl shadow-xl">
      <div className="flex items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <HardDrive className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Neural Model Hub
            </h1>
            <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-indigo-500/15 text-indigo-300 uppercase tracking-wider">
              Edge Offline Inference
            </span>
          </div>
          <p className="text-base sm:text-lg text-slate-300 mt-2 leading-relaxed max-w-3xl">
            Manage local INT8, GGUF, and CTranslate2 model weights for zero-bandwidth African speech and translation pipelines.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center justify-center gap-2.5 h-13 px-6 bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 hover:text-white rounded-2xl text-base font-bold transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500 self-start lg:self-center"
      >
        <RefreshCw className={`w-5 h-5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>Refresh Local Registry</span>
      </button>
    </header>
  );
}
