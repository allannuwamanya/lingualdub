import React from 'react';
import { Play } from 'lucide-react';

export interface GenerationTake {
  id: string;
  url: string;
  voiceName: string;
  lang: string;
  timestamp: string;
  engine: string;
  duration: number;
}

interface SpeechRecentTakesProps {
  takes: GenerationTake[];
  onClearTakes: () => void;
  onPlayTake: (url: string, voiceName: string, lang: string, engine: string) => void;
}

export default function SpeechRecentTakes({
  takes,
  onClearTakes,
  onPlayTake,
}: SpeechRecentTakesProps) {
  if (takes.length === 0) return null;

  return (
    <div className="space-y-4 pt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Recent Generation Takes (A/B Audition):
        </span>
        <button
          type="button"
          onClick={onClearTakes}
          className="text-sm font-semibold text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
        >
          Clear Takes
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {takes.map((take, idx) => (
          <div
            key={take.id}
            className="p-5 bg-[#070b14] rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-200 font-mono text-xs font-bold">
                  Take {idx + 1}
                </span>
                <p className="font-extrabold text-white truncate text-base">{take.voiceName}</p>
              </div>
              <p className="text-sm text-slate-300 font-mono">
                {take.engine} • {take.lang.toUpperCase()} • ~{take.duration}s
              </p>
            </div>

            <button
              type="button"
              onClick={() => onPlayTake(take.url, take.voiceName, take.lang, take.engine)}
              className="h-11 px-4.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 hover:text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 text-indigo-400 fill-current" />
              <span>Audition</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
