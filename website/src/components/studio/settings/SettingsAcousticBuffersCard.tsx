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
      className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
        <h2 className="text-xl font-black text-white flex items-center gap-3">
          <Clock className="w-6 h-6 text-indigo-400" />
          <span>Acoustic Latency & Storage Buffers</span>
        </h2>
        <button
          type="button"
          onClick={onClearCache}
          className="text-sm text-rose-300 hover:text-white font-sans font-bold flex items-center gap-2 cursor-pointer bg-rose-500/15 hover:bg-rose-500/25 px-4.5 py-2.5 rounded-xl transition-colors h-11 focus-visible:ring-2 focus-visible:ring-rose-500"
          title="Clear all local audio session takes and reset storage"
        >
          <Trash2 className="w-4 h-4" />
          <span>Flush Cache</span>
        </button>
      </div>

      <div className="space-y-4 text-base">
        <div className="flex justify-between py-2 border-b border-white/[0.06]">
          <span className="text-slate-300 font-medium">Model Cache Directory:</span>
          <span className="text-slate-100 font-mono font-semibold">~/.cache/lingualdub/models</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/[0.06]">
          <span className="text-slate-300 font-medium">Duplex Barge-In Interruption Window:</span>
          <span className="text-emerald-400 font-bold font-mono">&lt; 250 ms</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/[0.06]">
          <span className="text-slate-300 font-medium">Audio Sampling Standard:</span>
          <span className="text-slate-100 font-mono font-semibold">16,000 Hz Mono PCM</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-300 font-medium">Speaker Embedding Dimensions:</span>
          <span className="text-indigo-400 font-bold font-mono">192-d ECAPA-TDNN</span>
        </div>
      </div>
    </section>
  );
}
