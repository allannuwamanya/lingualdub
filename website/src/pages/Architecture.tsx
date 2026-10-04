import React from 'react';
import GithubIcon from '../components/GithubIcon';
import ArchitecturePipelineFlow from '../components/architecture/ArchitecturePipelineFlow';
import ArchitectureRepoBlueprint from '../components/architecture/ArchitectureRepoBlueprint';

const DEV_LIFECYCLE = [
  'Profile language + resources',
  'Select / register components',
  'Compose pipeline',
  'Run baseline',
  'Adapt / generate data / process',
  'Evaluate',
  'Save models & artifacts',
  'Replace components or iterate',
];

const COMPONENT_CATEGORIES = [
  { type: 'asr', label: 'ASR', desc: 'Automatic Speech Recognition' },
  { type: 'translation', label: 'Translation', desc: 'Text & Speech translation' },
  { type: 'tts', label: 'TTS', desc: 'Text-to-Speech synthesis' },
  { type: 'alignment', label: 'Alignment', desc: 'Temporal & forced alignment' },
  { type: 'speaker', label: 'Speaker', desc: 'Speaker embeddings & modeling' },
  { type: 'code_switch', label: 'Code-Switch', desc: 'Multilingual segment routing' },
  { type: 'adaptation', label: 'Adaptation', desc: 'LoRA, adapters & fine-tuning' },
  { type: 'eval', label: 'Evaluation', desc: 'Metrics & human eval protocols' },
  { type: 'preprocessing', label: 'Preprocessing', desc: 'Audio & text normalization' },
  { type: 'custom', label: '+ Custom', desc: 'User-defined registered types' },
];

export default function Architecture() {
  return (
    <div className="bg-[#070b14] text-white min-h-full page-fade-in">
      {/* Page header */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-4">
            System Blueprint & Contract Flow
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Architecture
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl font-normal">
            How the core abstractions connect into a reproducible, closed-loop development cycle —
            from language profiling through assembly-time verification back into the registry.
          </p>
        </div>
      </section>

      {/* Pipeline execution flow */}
      <ArchitecturePipelineFlow />

      {/* Development lifecycle loop */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Iterative Development Loop</h2>
            <p className="text-slate-300 mt-2 text-base leading-relaxed max-w-2xl">
              Saved artifacts re-enter the loop as registered resources and components — turning development into a closed-loop feedback engine.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {DEV_LIFECYCLE.map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span
                  className={`px-5 py-3 rounded-xl text-sm font-semibold shadow-md transition-all ${
                    i === 0 || i === DEV_LIFECYCLE.length - 1
                      ? 'bg-indigo-600 text-white font-bold shadow-indigo-600/25'
                      : 'bg-[#101726] text-slate-200 hover:text-white'
                  }`}
                >
                  {step}
                </span>
                {i < DEV_LIFECYCLE.length - 1 && (
                  <span className="text-indigo-400 font-bold text-base">→</span>
                )}
              </span>
            ))}
            <span className="text-indigo-400 font-bold text-sm ml-2 bg-indigo-500/10 px-3 py-1.5 rounded-lg">↺ loop</span>
          </div>
        </div>
      </section>

      {/* Component categories */}
      <section className="py-20 bg-[#070b14]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Supported Component Categories</h2>
            <p className="text-slate-400 text-base mt-2">
              Pluggable primitives registered via declarative manifests without modifying framework code.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {COMPONENT_CATEGORIES.map((c) => (
              <div
                key={c.type}
                className="bg-[#101726] hover:bg-[#141d30] rounded-2xl p-5 text-center transition-all shadow-md group"
              >
                <p className="font-bold text-white text-base mb-1.5 group-hover:text-indigo-300 transition-colors">{c.label}</p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Repository blueprint */}
      <ArchitectureRepoBlueprint />

      {/* GitHub CTA */}
      <section className="py-20 bg-[#070b14] text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Explore the Codebase</h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            The complete Python package, research modules, notebooks, and tests are open source on GitHub.
          </p>
          <div className="pt-2">
            <a
              href="https://github.com/allannuwamanya/lingualdub"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer text-base"
            >
              <GithubIcon className="w-5 h-5 text-white" />
              <span>allannuwamanya/lingualdub</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
