import React from 'react';
import { Code2, Cpu, Layers, FileCode2 } from 'lucide-react';

const HIGHLIGHTS = [
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
];

const CODE_SAMPLE = `import lingualdub as ld

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
print(f"Dubbed Artifacts: {result.artifacts}")`;

export default function DocsQuickstartCode() {
  return (
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
          {CODE_SAMPLE}
        </pre>
      </div>

      {/* Architecture Highlights */}
      <div className="space-y-4">
        {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
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
  );
}
