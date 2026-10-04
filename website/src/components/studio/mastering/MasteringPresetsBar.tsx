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
      className="bg-[#101726] rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl"
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-sm font-bold text-slate-300 flex items-center gap-2 mr-1">
          <Sparkles className="w-5 h-5 text-indigo-400" /> Presets:
        </span>
        {MASTERING_PRESETS.map((p) => {
          const active = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onApplyPreset(p)}
              className={`h-11 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-[#070b14] text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {currentDesc && (
        <span className="text-sm text-slate-400 hidden lg:inline font-mono font-medium">
          {currentDesc}
        </span>
      )}
    </div>
  );
}
