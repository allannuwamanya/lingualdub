import React from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

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
      className="p-6 bg-[#101726] rounded-3xl shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between text-sm text-indigo-300 font-semibold">
        <span className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Processing Voice Extraction Pipeline...</span>
        </span>
        <span className="font-mono text-xs text-slate-400">
          Step {activeStepIndex + 1} of {CLONING_STEPS.length} ({percent}%)
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-[#070b14] h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Step Checklist */}
      <div className="space-y-2 pt-1">
        {CLONING_STEPS.map((step, idx) => {
          const isDone = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex;

          return (
            <div
              key={idx}
              className={`text-xs flex items-center gap-2.5 transition-colors ${
                isDone
                  ? 'text-emerald-400 font-semibold'
                  : isCurrent
                  ? 'text-white font-bold animate-pulse'
                  : 'text-slate-600'
              }`}
            >
              <span className="w-4 text-center font-mono">
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
