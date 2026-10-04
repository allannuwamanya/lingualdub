import React from 'react';
import { ArrowRight, AudioWaveform, Cpu, GitBranch, Globe2, Layers, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';

const ABSTRACTIONS = [
  {
    icon: Globe2,
    name: 'Language',
    tagline: 'Resource-Aware Profile',
    desc: 'Represents a language together with its metadata, supported processing tasks, available resources, related languages, and compatible components. Resource scarcity is treated as a first-class architectural property.',
    highlights: ['Dialect and orthography flags', 'Resource scarcity profile', 'Cross-dialect phylogenetic affinities', 'Compatible component manifest mapping'],
  },
  {
    icon: Layers,
    name: 'Resource',
    tagline: 'Ethical & Provenance-Backed Asset',
    desc: 'Represents a data asset — speech recordings, text corpora, parallel translations, lexicons, pronunciation dictionaries, model checkpoints, or evaluation sets — with mandatory provenance tracking and cryptographically verified consent.',
    highlights: ['Mandatory provenance tracking', 'Voice consent verification hash', 'Quality & version metadata', 'Compatible component mapping'],
  },
  {
    icon: Cpu,
    name: 'Component',
    tagline: 'Compose-Time Contract Safety',
    desc: 'A replaceable processing unit with a stable input/output contract. Declares what capabilities it requires from upstream stages and provides to downstream stages, catching incompatibilities before model weights are loaded.',
    highlights: ['Types: ASR, TTS, Translation, Alignment, Speaker, Eval', 'Strict requires / provides contracts', 'Multi-tier degraded execution fallback path', 'Manifest-based dynamic discovery'],
  },
  {
    icon: GitBranch,
    name: 'Pipeline',
    tagline: 'Resilient Workflow Execution',
    desc: 'A composition of components connected by shared data representations, executed as a reproducible workflow. Features built-in 3-mode fault tolerance (abort, skip, degrade) and per-segment language routing for code-switching.',
    highlights: ['3-tier fault tolerance: abort · skip · degrade', 'Per-segment language routing for mixed speech', 'Structural code-switching support', 'Declarative YAML configuration format'],
  },
  {
    icon: AudioWaveform,
    name: 'Result',
    tagline: 'Structured Output with Provenance',
    desc: 'A structured output carrying text content, segment-level data, speaker and language metadata, confidence scores, processing status (complete, partial, degraded), warnings, and links to generated audio/text artifacts.',
    highlights: ['Status: complete · partial · degraded', 'Segment-level language tags & timing stamps', 'Confidence scores & warning propagation', 'Artifact provenance links'],
  },
  {
    icon: Sliders,
    name: 'Registry',
    tagline: 'Zero Core Modifications',
    desc: 'The decoupled mechanism for discovering, registering, and resolving languages, resources, components, and evaluators without editing framework internals. Extensions ship a manifest; the registry scans and mounts them at startup.',
    highlights: ['Manifest-based discovery (lingualdub.manifest.json)', 'Versioned entry pinning & conflict policies', 'Namespaced conflict resolution', 'Automatic startup filesystem scanning'],
  },
];

export default function Abstractions() {
  return (
    <div className="bg-[#070b14] text-white min-h-full page-fade-in">
      {/* Page header */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-4">
            Architectural Primitives
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Core Abstractions
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl font-normal">
            LingualDub is organized around five interoperable primitives in a closed, provenance-tracked loop,
            orchestrated by a decoupled Registry for zero-core-modification extensibility.
          </p>
        </div>
      </section>

      {/* Closed loop sequence strip */}
      <section className="py-10 bg-[#070b14]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
            {['Language', 'Resource', 'Component', 'Pipeline', 'Result', '↺ Registry'].map((a, i) => (
              <span key={a} className="flex items-center gap-3">
                <span
                  className={`px-5 py-2.5 rounded-xl font-bold shadow-md transition-all ${
                    i < 5
                      ? 'bg-[#101726] text-white'
                      : 'bg-indigo-600 text-white shadow-indigo-600/25'
                  }`}
                >
                  {a}
                </span>
                {i < 5 && <span className="text-indigo-400 font-bold text-base">→</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Abstractions grid */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ABSTRACTIONS.map(({ icon: Icon, name, tagline, desc, highlights }) => (
              <div
                key={name}
                className="bg-[#101726] hover:bg-[#141d30] rounded-3xl p-8 shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">{name}</h3>
                      <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 mt-1.5">
                        {tagline}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-base leading-relaxed mb-6 font-normal">
                    {desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/[0.05]">
                  <ul className="space-y-2.5">
                    {highlights.map(h => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural success criteria */}
      <section className="py-20 bg-[#070b14]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Architectural Success Criteria</h2>
            <p className="text-slate-400 text-base mt-2">
              The framework succeeds if all extensions happen without touching core framework source code:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              ['New language', 'Register language metadata & dialect profiles in JSON/YAML.'],
              ['New model', 'Implement and register a Component interface with contract tokens.'],
              ['New method', 'Add an adapter or custom pipeline stage without altering existing graph.'],
              ['New dataset', 'Register a Resource with cryptographic consent provenance.'],
              ['New evaluator', 'Implement and register an Evaluator component with standard metrics.'],
              ['New pipeline', 'Compose existing components declaratively in YAML config files.'],
            ].map(([action, how]) => (
              <div key={action} className="bg-[#101726] hover:bg-[#141d30] rounded-2xl p-6 shadow-md transition-all">
                <p className="font-bold text-white text-base mb-2 text-indigo-300">{action}</p>
                <p className="text-slate-300 text-sm leading-relaxed">{how}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next CTA */}
      <section className="py-16 bg-[#0b101c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Next: Research Modules</h3>
            <p className="text-slate-400 text-sm mt-1">
              Temporal Alignment · Code-Switching · Voice Transfer · AV Sync · Voice Retention
            </p>
          </div>
          <Link
            to="/research"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all shrink-0 cursor-pointer text-sm"
          >
            <span>View Research Whitepaper</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
