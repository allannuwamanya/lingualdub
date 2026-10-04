import React from 'react';
import { Sparkles } from 'lucide-react';
import { MASTERING_PRESETS } from './masteringData';
import type { MasteringPreset } from './masteringData';

interface MasteringPresetsBarProps {
  activePreset: string;
  onApplyPreset: (preset: MasteringPreset) => void;
}

export default function MasteringPresetsBar({
  activePreset,
  onApplyPreset,
}: MasteringPresetsBarProps) {
  const currentDesc = MASTERING_PRESETS.find((p) => p.id === activePreset)?.desc;

  return (
    <div
      aria-label="Mastering Presets"
      className="bg-[#101726] rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-md"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-4 h-4 text-indigo-400" /> Presets:
        </span>
        {MASTERING_PRESETS.map((p) => {
          const active = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onApplyPreset(p)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25'
                  : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {currentDesc && (
        <span className="text-xs text-slate-400 hidden lg:inline font-mono">
          {currentDesc}
        </span>
      )}
    </div>
  );
}
