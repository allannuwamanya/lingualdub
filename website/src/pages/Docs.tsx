import React from 'react';
import { BookOpen, Code2, Cpu, FileCode2, Layers, Sparkles, Terminal } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';

export default function Docs() {
  return (
    <div className="bg-[#070b14] text-white min-h-full page-fade-in">
      {/* Header */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 text-indigo-300 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Developer & API Reference • v0.1.0 Stable</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Documentation
          </h1>
          <p className="text-xl sm:text-2xl text-slate-200 leading-relaxed max-w-3xl font-normal">
            API reference, SDK integration guides, and component contracts for building, composing,
            and deploying speech AI pipelines with LingualDub.
          </p>
        </div>
      </section>

      {/* Release Announcement Banner (Elevated & Borderless) */}
      <section className="py-10 bg-[#070b14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#101726] rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Release v0.1.0 Stable</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">LingualDub v0.1.0 is Live</h2>
              <p className="text-lg text-slate-200 max-w-2xl leading-relaxed">
                All foundational milestones (M0–M8) are complete: ASR, MT, TTS, code-switching, temporal alignment, voice retention, cross-lingual voice transfer, audio-visual sync, and Runyankole generalisation proof.
              </p>
            </div>
            <a
              href="https://github.com/allannuwamanya/lingualdub"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 transition-all shrink-0 cursor-pointer text-base"
            >
              <GithubIcon className="w-5 h-5 text-white" />
              <span>Follow on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Python SDK Quickstart */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Python SDK: End-to-End Pipeline</h2>
            <p className="text-lg text-slate-200 mt-2 max-w-2xl leading-relaxed">
              Execute a speech dubbing pipeline with declarative YAML configuration, assembly-time capability checking, and cryptographic consent tracking:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Code Block Container */}
            <div className="bg-[#050811] rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-[#090e1c] px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="font-mono text-xs text-slate-400 ml-2">quickstart.py</span>
                </div>
                <span className="text-xs font-mono text-indigo-400 font-semibold">Python 3.10+</span>
              </div>
              <pre className="p-6 font-mono text-sm sm:text-[15px] text-slate-200 overflow-x-auto leading-relaxed">
{`import lingualdub as ld

# 1. Initialize Registry & discover manifests
registry = ld.Registry(conflict_policy=ld.ConflictPolicy.HIGHEST_VERSION)
scanner = ld.ManifestScanner(registry)
scanner.scan()

# 2. Load declarative pipeline configuration
loader = ld.ConfigLoader(registry)
pipeline = loader.load_file("configs/luganda_english_baseline.yaml")

# 3. Create speech resource with recorded consent
audio = ld.Resource(
    id="lug_sample_01",
    kind=ld.ResourceKind.SPEECH,
    language="lug",
    version="1.0.0",
    path="data/samples/sample_lug.wav",
    provenance={"consent_basis": "research_evaluation"}
)

# 4. Execute pipeline with automatic contract checking
executor = ld.PipelineExecutor(pipeline)
result = executor.run(audio)

print(f"Status: {result.status.value.upper()}")
for seg in result.segments:
    print(f"[{seg.start:.2f}s -> {seg.end:.2f}s] ({seg.language}): {seg.text}")
print(f"Dubbed Artifacts: {result.artifacts}")`}
              </pre>
            </div>

            {/* Architecture Highlights */}
            <div className="space-y-4">
              {[
                {
                  icon: Code2,
                  title: 'Registry & Dynamic Discovery',
                  desc: 'Discover and load ASR, translation, TTS, and alignment models declared in lingualdub.manifest.json files without modifying core code.',
                },
                {
                  icon: Cpu,
                  title: 'Assembly-Time Capability Validation',
                  desc: 'Pipelines statically verify stage requires tokens against upstream provides tokens before heavy model weights load.',
                },
                {
                  icon: Layers,
                  title: 'Multi-Tier Fault Tolerance',
                  desc: 'Selectable failure modes (ABORT, SKIP, DEGRADE) ensure graceful fallbacks and warning propagation when issues arise.',
                },
                {
                  icon: FileCode2,
                  title: 'Strict Provenance & Consent Enforcement',
                  desc: 'Every run records pipeline structure, model versions, dataset provenance, and enforces consent_basis for ethical voice AI.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-[#101726] hover:bg-[#141d30] rounded-2xl p-7 shadow-md flex items-start gap-4 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1.5">{title}</h3>
                    <p className="text-base text-slate-200 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Guides */}
      <section className="py-20 bg-[#070b14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Technical Guides & Architecture</h2>
            <p className="text-lg text-slate-200 mt-2">
              Complete technical documentation for building adapters, registering datasets, and evaluating pipelines:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Component Authoring Guide',
                desc: 'Subclass Component, declare requires/provides capability tokens, and implement run() and degrade() fallback paths.',
                tag: 'Components',
              },
              {
                title: 'Manifest & Plugin Registry',
                desc: 'How to write lingualdub.manifest.json files and handle conflict policies (NAMESPACED, HIGHEST_VERSION, EXPLICIT).',
                tag: 'Registry',
              },
              {
                title: 'Code-Switching & Routing',
                desc: 'Segment-authoritative language tagging and per-segment dynamic routing across heterogeneous model adapters.',
                tag: 'Code-Switch',
              },
              {
                title: 'Temporal Alignment & Speech Rate',
                desc: 'Fitting translated speech into source timing envelopes using forced alignment, duration modeling, and rate scaling.',
                tag: 'Alignment',
              },
              {
                title: 'Evaluation & Run Comparison',
                desc: 'Benchmarking WER, CER, BLEU, chrF, and speaker similarity with provenance-validated compare_runs() utilities.',
                tag: 'Evaluation',
              },
              {
                title: 'Audio-Visual Sync & Video Output',
                desc: 'Snapping segment boundaries to dialogue visual cues and generating dubbed .mp4 video artifacts with full provenance.',
                tag: 'AV-Sync',
              },
            ].map(sec => (
              <div
                key={sec.title}
                className="bg-[#101726] hover:bg-[#141d30] rounded-2xl p-7 flex flex-col justify-between shadow-md transition-all group"
              >
                <div>
                  <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 inline-block mb-4">
                    {sec.tag}
                  </span>
                  <h3 className="font-bold text-white text-xl mb-2.5 group-hover:text-indigo-300 transition-colors">{sec.title}</h3>
                  <p className="text-base text-slate-300 leading-relaxed font-normal">{sec.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center gap-2 text-sm text-emerald-400 font-semibold">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Available in v0.1.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
