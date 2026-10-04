import React from 'react';
import { ArrowRight, Clock, Infinity, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const MODULES = [
  {
    title: 'Temporal Alignment & Speech Rate',
    priority: 'Near-Term',
    dep: null,
    desc: 'Duration modeling, speech-rate control, segment fitting, and cross-lingual synchronization. Duration models predict target speech duration from source segments for video dubbing without robotic compression artifacts.',
    items: ['Cross-lingual duration modeling', 'Speech-rate adaptation algorithms', 'Phoneme boundary dynamic fitting', 'Cross-lingual sync for broadcast dubbing'],
  },
  {
    title: 'Code-Switching & Dynamic Routing',
    priority: 'Near-Term',
    dep: null,
    desc: 'Detection, phonetic representation, and per-segment routing for mixed-language speech. Handles multi-language utterances natively — a standard feature of everyday communication across African urban centers.',
    items: ['Per-segment language identification', 'Dynamic downstream model routing', 'Mixed-language utterance representation', 'Low-resource code-switch benchmarks'],
  },
  {
    title: 'Voice-Retention Evaluation',
    priority: 'Near-Term',
    dep: 'Prerequisite for Voice Transfer',
    desc: 'Repeatable speaker-similarity measurement and human evaluation protocols, established before automated neural metrics are deployed in production.',
    items: ['Speaker similarity metrics (MOS, SECS)', 'Human evaluation protocol design', 'Reproducible baseline establishment', 'Evaluator component interfaces'],
  },
  {
    title: 'Cross-Lingual Voice Transfer',
    priority: 'Open-Ended',
    dep: 'Requires Voice-Retention Eval',
    desc: 'Speaker representation and voice preservation across linguistic boundaries. Maintains vocal identity and timbre when translating spoken content across diverse language families.',
    items: ['192-d ECAPA speaker embedding extraction', 'Cross-lingual adaptation pipelines', 'Voice preservation across tonal families', 'Consent-gated resource compatibility'],
  },
  {
    title: 'Audio-Visual Synchronization',
    priority: 'Mid-Term',
    dep: 'Requires Temporal Alignment',
    desc: 'Dialogue timing and visual lip-sync alignment for audiovisual dubbing — the signature workload that gives LingualDub its name.',
    items: ['Lip-sync alignment models', 'Dialogue visual timing control', 'AV sync evaluation metrics', 'Dubbed MP4 artifact generation'],
  },
];

const priorityStyle: Record<string, string> = {
  'Near-Term': 'bg-emerald-500/15 text-emerald-300',
  'Open-Ended': 'bg-indigo-500/15 text-indigo-300',
  'Mid-Term': 'bg-purple-500/15 text-purple-300',
};

const priorityIcon: Record<string, typeof Zap> = {
  'Near-Term': Zap,
  'Open-Ended': Infinity,
  'Mid-Term': Clock,
};

export default function Research() {
  return (
    <div className="bg-[#070b14] text-white min-h-full page-fade-in">
      {/* Page header */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-4">
            SALT Research & Benchmarking Agendas
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Research Challenge Modules
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl font-normal">
            Structured research agendas with falsifiable baselines, concrete completion criteria,
            and explicit dependency ordering for low-resource speech AI.
          </p>
        </div>
      </section>

      {/* Priority Legend */}
      <section className="py-8 bg-[#070b14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority Tiers:</span>
            {Object.entries(priorityStyle).map(([label, style]) => {
              const Icon = priorityIcon[label];
              return (
                <span key={label} className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${style}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-16 bg-[#0b101c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {MODULES.map(({ title, priority, dep, desc, items }) => {
              const Icon = priorityIcon[priority];
              return (
                <div
                  key={title}
                  className="bg-[#101726] hover:bg-[#141d30] rounded-3xl p-8 shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{title}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${priorityStyle[priority]}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{priority}</span>
                      </span>
                    </div>

                    {dep && (
                      <div className="mb-4 inline-flex items-center gap-2 text-xs text-indigo-300 bg-white/[0.05] px-3.5 py-1.5 rounded-xl font-medium">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                        <span>{dep}</span>
                      </div>
                    )}

                    <p className="text-slate-300 text-base leading-relaxed mb-6 font-normal">
                      {desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/[0.05]">
                    <ul className="space-y-2.5">
                      {items.map(item => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}

            {/* Ethics card */}
            <div className="bg-[#101726] hover:bg-[#141d30] text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Ethical Voice Policy</h3>
                <p className="text-slate-300 text-base leading-relaxed mb-6 font-normal">
                  Voice transfer and voice-retention evaluation both process individual biometric voice data.{' '}
                  <strong className="text-white font-semibold">Consent is enforced as a structural requirement at the Resource level</strong> —
                  a voice resource without recorded consent is rejected by voice-transfer components.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/[0.05]">
                  {[
                    'Consent flag on Resource',
                    'Transfer components check consent',
                    'Mandatory provenance trace',
                    'Unconsented data rejected',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs font-mono text-indigo-400 mt-8 pt-4 border-t border-white/[0.05] font-semibold">
                Enforced via Resource.provenance.consent_verified
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next CTA */}
      <section className="py-16 bg-[#070b14]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Next: Python SDK Documentation</h3>
            <p className="text-slate-400 text-sm mt-1">
              Declarative configs, component authoring, and end-to-end quickstart examples.
            </p>
          </div>
          <Link
            to="/docs"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all shrink-0 cursor-pointer text-sm"
          >
            <span>View Developer Docs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
