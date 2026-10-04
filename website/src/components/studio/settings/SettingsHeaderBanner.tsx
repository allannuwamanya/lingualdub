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
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 sm:p-9 bg-[#101726] rounded-3xl shadow-xl">
      <div className="flex items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Cpu className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Engine & Hardware Diagnostics
            </h1>
            <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-indigo-500/15 text-indigo-300 uppercase tracking-wider">
              Inference Stack
            </span>
          </div>
          <p className="text-base sm:text-lg text-slate-300 mt-2 leading-relaxed max-w-3xl">
            Configure inference backend endpoints, hardware compute thresholds, and API authentication credentials.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
        <button
          type="button"
          onClick={onProbeBackend}
          disabled={isProbing}
          className="h-13 px-6 bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 hover:text-white rounded-2xl text-base font-bold flex items-center gap-2.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <RefreshCw className={`w-5 h-5 text-indigo-400 ${isProbing ? 'animate-spin' : ''}`} />
          <span>Probe Local Daemon</span>
        </button>
      </div>
    </header>
  );
}
