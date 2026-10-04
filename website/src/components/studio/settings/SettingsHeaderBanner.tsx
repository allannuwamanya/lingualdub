import React from 'react';
import { Cpu, RefreshCw } from 'lucide-react';

interface SettingsHeaderBannerProps {
  onProbeBackend: () => void;
  isProbing: boolean;
}

export default function SettingsHeaderBanner({
  onProbeBackend,
  isProbing,
}: SettingsHeaderBannerProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 sm:p-8 bg-[#101726] rounded-3xl shadow-xl">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Cpu className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Engine & Hardware Diagnostics
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300">
              Inference Stack
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Configure inference backend endpoints, hardware compute thresholds, and API authentication credentials.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onProbeBackend}
          disabled={isProbing}
          className="px-5 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer h-12 focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
          <span>Probe Local Daemon</span>
        </button>
      </div>
    </header>
  );
}
