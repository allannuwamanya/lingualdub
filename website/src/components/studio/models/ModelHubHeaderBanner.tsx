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
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <HardDrive className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Neural Model Hub
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              Edge Offline Inference
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage local INT8, GGUF, and CTranslate2 model weights for zero-bandwidth African speech pipelines.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer h-12 shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <RefreshCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>Refresh Local Registry</span>
      </button>
    </header>
  );
}
