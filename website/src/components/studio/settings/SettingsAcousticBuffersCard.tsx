import React from 'react';
import { Clock, Trash2 } from 'lucide-react';

interface SettingsAcousticBuffersCardProps {
  onClearCache: () => void;
}

export default function SettingsAcousticBuffersCard({
  onClearCache,
}: SettingsAcousticBuffersCardProps) {
  return (
    <section
      aria-label="Acoustic Latency and Storage Buffers"
      className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5"
    >
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>Acoustic Latency & Storage Buffers</span>
        </h2>
        <button
          type="button"
          onClick={onClearCache}
          className="text-xs text-rose-400 hover:text-rose-300 font-sans flex items-center gap-1.5 cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 rounded-xl transition-colors min-h-[38px] focus-visible:ring-2 focus-visible:ring-rose-500"
          title="Clear all local audio session takes and reset storage"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Flush Cache</span>
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b border-white/[0.05]">
          <span className="text-slate-300">Model Cache Directory:</span>
          <span className="text-slate-100 font-mono">~/.cache/lingualdub/models</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/[0.05]">
          <span className="text-slate-300">Duplex Barge-In Interruption Window:</span>
          <span className="text-emerald-400 font-bold font-mono">&lt; 250 ms</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/[0.05]">
          <span className="text-slate-300">Audio Sampling Standard:</span>
          <span className="text-slate-100 font-mono">16,000 Hz Mono PCM</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-300">Speaker Embedding Dimensions:</span>
          <span className="text-indigo-400 font-bold font-mono">192-d ECAPA-TDNN</span>
        </div>
      </div>
    </section>
  );
}
