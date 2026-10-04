import React from 'react';
import { HardDrive, Sparkles, Radio, Film } from 'lucide-react';

const PILLARS = [
  {
    icon: HardDrive,
    color: 'text-indigo-400',
    title: 'Offline Edge Inference',
    desc: 'Runs on CPU hardware without mandatory internet connection using INT8 ONNX & GGUF quantized models.',
    badge: 'Zero-Bandwidth',
  },
  {
    icon: Sparkles,
    color: 'text-purple-400',
    title: '5-Second Voice Cloning',
    desc: '192-d ECAPA-TDNN neural timbre transfer captures tonal accents while cryptographically verifying voice consent.',
    badge: 'Ethical Sovereignty',
  },
  {
    icon: Radio,
    color: 'text-indigo-400',
    title: 'Full-Duplex Voice Agent',
    desc: 'Conversational dialogue loop with acoustic barge-in interruption for natural healthcare & USSD fintech flows.',
    badge: '< 250ms Latency',
  },
  {
    icon: Film,
    color: 'text-purple-400',
    title: 'Lip-Sync Dubbing Room',
    desc: 'Cross-lingual translation with automated syllable alignment and EBU R128 loudness mastering for broadcast.',
    badge: 'Timing HUD',
  },
];

export default function HomePillars() {
  return (
    <section className="py-24 bg-[#070b14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for Real-World African Realities
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            From zero-bandwidth edge inference to tonal dialect preservation and ethical voice sovereignty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map(({ icon: Icon, color, title, desc, badge }) => (
            <div
              key={title}
              className="bg-[#101726] hover:bg-[#141d30] rounded-2xl p-7 shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-5">
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5">{title}</h3>
                <p className="text-slate-200 text-base leading-relaxed">{desc}</p>
              </div>
              <div className="pt-6 mt-6">
                <span className="text-sm font-mono font-medium px-3.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300">
                  {badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
