import React from 'react';
import { BookOpen } from 'lucide-react';

const GUIDES = [
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
];

export default function DocsTechnicalGuides() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {GUIDES.map((sec) => (
        <div
          key={sec.title}
          className="bg-[#101726] hover:bg-[#141d30] rounded-2xl p-7 flex flex-col justify-between shadow-md transition-all group"
        >
          <div>
            <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 inline-block mb-4">
              {sec.tag}
            </span>
            <h3 className="font-bold text-white text-xl mb-2.5 group-hover:text-indigo-300 transition-colors">
              {sec.title}
            </h3>
            <p className="text-base text-slate-300 leading-relaxed font-normal">{sec.desc}</p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center gap-2 text-sm text-emerald-400 font-semibold">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Available in v0.1.0</span>
          </div>
        </div>
      ))}
    </div>
  );
}
