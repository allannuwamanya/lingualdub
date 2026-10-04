import React from 'react';
import { RefreshCw } from 'lucide-react';

export const CLONING_STEPS = [
  'Segmenting reference audio & computing energy VAD...',
  'Extracting 192-dimensional ECAPA-TDNN speaker embedding...',
  'Signing cryptographic voice donor sovereignty hash...',
  'Compiling zero-shot .afrivoice container package...',
];

interface ClonerProgressPipelineProps {
  activeStepIndex: number;
}

export default function ClonerProgressPipeline({
  activeStepIndex,
}: ClonerProgressPipelineProps) {
  const percent = Math.min(100, Math.round(((activeStepIndex + 1) / CLONING_STEPS.length) * 100));

  return (
    <div
      role="status"
      aria-live="polite"
      className="p-7 bg-[#101726] rounded-3xl shadow-xl space-y-5"
    >
      <div className="flex items-center justify-between text-base sm:text-lg text-indigo-200 font-bold">
        <span className="flex items-center gap-2.5">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Processing Voice Extraction Pipeline...</span>
        </span>
        <span className="font-mono text-sm text-slate-300">
          Step {activeStepIndex + 1} of {CLONING_STEPS.length} ({percent}%)
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-[#070b14] h-3 rounded-full overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Step Checklist */}
      <div className="space-y-3 pt-1">
        {CLONING_STEPS.map((step, idx) => {
          const isDone = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex;

          return (
            <div
              key={idx}
              className={`text-sm sm:text-base flex items-center gap-3 transition-colors ${
                isDone
                  ? 'text-emerald-400 font-bold'
                  : isCurrent
                  ? 'text-white font-extrabold animate-pulse'
                  : 'text-slate-600'
              }`}
            >
              <span className="w-5 text-center font-mono text-base">
                {isDone ? '✓' : isCurrent ? '▶' : '○'}
              </span>
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
