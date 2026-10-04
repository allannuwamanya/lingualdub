import React from 'react';

const PIPELINE_STEPS = [
  { label: 'LANGUAGE & RESOURCES', sub: 'Language metadata, dialect profiles, phoneme inventories, and consent-verified speech/text assets.' },
  { label: 'COMPONENTS', sub: 'ASR · Translation · TTS · Alignment · Speaker Modeling · Evaluation.' },
  { label: 'PIPELINE COMPOSITION', sub: 'Assembly-time contract validation and multi-tier fault-tolerance mode selection.' },
  { label: 'EXECUTION', sub: 'Per-segment routing, code-switch handling, and degraded execution fallback.' },
  { label: 'EVALUATION & ARTIFACTS', sub: 'Evaluator components, metrics recording, and provenance-tracked outputs.' },
  { label: 'TARGET APPLICATIONS', sub: 'Dubbing · Speech-to-Speech · Subtitles · Edge Clinical & USSD Assistants.' },
];

export default function ArchitecturePipelineFlow() {
  return (
    <section className="py-20 bg-[#070b14]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Pipeline Execution Flow</h2>
          <p className="text-slate-400 text-base mt-2">
            Linear stage execution with assembly-time contract verification and fallback routing.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.label} className="relative flex items-start gap-6 mb-6 last:mb-0">
              {/* Connector line */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="absolute left-[21px] top-12 bottom-0 w-0.5 bg-white/10" />
              )}
              {/* Step badge */}
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-300 font-extrabold text-base flex items-center justify-center shrink-0 z-10 shadow-md">
                {i + 1}
              </div>
              {/* Step content */}
              <div className="flex-1 pb-2">
                <div className="bg-[#101726] hover:bg-[#141d30] rounded-2xl p-6 transition-all shadow-lg">
                  <p className="font-bold text-white text-base tracking-wide">{step.label}</p>
                  <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{step.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
