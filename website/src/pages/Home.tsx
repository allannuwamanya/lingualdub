import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Sparkles,
  Play,
  Pause,
  Radio,
  Film,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import GithubIcon from '../components/GithubIcon';

const SAMPLE_VOICES = [
  {
    lang: 'lug',
    label: 'Oluganda (Uganda)',
    speaker: 'Nakato (Central Dialect)',
    text: "Oli otya nnyabo! LingualDub ekoze amagero mu kussa amaloboozi gaffe ag'ennono mu tekinologiya ow'omulembe.",
    flag: '🇺🇬',
  },
  {
    lang: 'swa',
    label: 'Kiswahili (East Africa)',
    speaker: 'Mwangi (Nairobi Prosody)',
    text: 'Habari yako! Tunaleta mapinduzi ya sauti za Kiafrika kupitia mifumo ya kijasusi ya hali ya juu.',
    flag: '🇰🇪',
  },
  {
    lang: 'yor',
    label: 'Èdè Yorùbá (Nigeria)',
    speaker: 'Adebayo (Lagos Accent)',
    text: 'Ẹ ku ojumo! Imọ-ẹrọ ohun titun fun awọn ede Afirika ti de pẹlu pipe to daju.',
    flag: '🇳🇬',
  },
];

export default function Home() {
  const [activeVoiceIndex, setActiveVoiceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVoice = (text: string, lang: string) => {
    if (typeof window === 'undefined') return;

    if (isPlaying) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase().includes(lang) ||
          v.name.toLowerCase().includes(lang)
      );
      if (match) utterance.voice = match;
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  return (
    <div className="bg-[#070b14] text-white selection:bg-indigo-600 selection:text-white page-fade-in">
      {/* ── Hero ── */}
      <section className="relative pt-28 pb-24 overflow-hidden">
        {/* Soft atmospheric gradient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 text-indigo-300 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Sovereign Voice AI for 51+ African Languages</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            Speech AI Infrastructure
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
              for Low-Resource Languages
            </span>
          </h1>

          <p className="text-lg sm:text-2xl text-slate-200 leading-relaxed max-w-3xl mx-auto font-normal">
            An open, modular development framework for building, adapting, composing, and evaluating 
            speech-AI systems — standardizing pipelines so models and tools can be wired together and extended.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer text-base"
            >
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Launch African Voice Studio</span>
            </Link>

            <Link
              to="/docs"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] transition-all cursor-pointer text-base"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Developer Docs</span>
            </Link>

            <a
              href="https://github.com/allannuwamanya/lingualdub"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer text-base"
            >
              <GithubIcon className="w-4 h-4 text-slate-300" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* ── Interactive Live Audition Showcase (Borderless & Elevated) ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
          <div className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">
                    Live Phonetic Audition Preview
                  </h2>
                  <p className="text-base text-slate-300">
                    Hear authentic neural cadence synthesized directly in your browser.
                  </p>
                </div>
              </div>

              {/* Language Ghost Pills */}
              <div className="flex items-center gap-1.5 bg-[#0b101c] p-1.5 rounded-xl">
                {SAMPLE_VOICES.map((item, idx) => (
                  <button
                    key={item.lang}
                    type="button"
                    onClick={() => {
                      setActiveVoiceIndex(idx);
                      if (isPlaying) {
                        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                        setIsPlaying(false);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      activeVoiceIndex === idx
                        ? 'bg-indigo-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{item.flag}</span>
                    <span className="hidden sm:inline">{item.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quote and Play Bar */}
            <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="text-sm font-mono text-indigo-400 mb-1.5 font-semibold">
                  {SAMPLE_VOICES[activeVoiceIndex].speaker}
                </div>
                <p className="text-lg sm:text-xl text-slate-100 italic leading-relaxed">
                  "{SAMPLE_VOICES[activeVoiceIndex].text}"
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handlePlayVoice(
                    SAMPLE_VOICES[activeVoiceIndex].text,
                    SAMPLE_VOICES[activeVoiceIndex].lang
                  )
                }
                className="h-13 px-7 rounded-xl font-bold text-base bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md shrink-0"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 text-white" />
                    <span>Pause Audition</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 text-white" />
                    <span>Audition Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip (No Box Outlines) ── */}
      <section className="bg-[#0b101c] py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '51+', label: 'African Languages' },
              { value: '< 250ms', label: 'Barge-In Latency' },
              { value: '192-d', label: 'ECAPA Embeddings' },
              { value: 'MIT', label: 'Open Source License' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-4xl sm:text-5xl font-black text-white tracking-tight">{s.value}</dt>
                <dd className="text-base text-slate-300 mt-2 font-medium">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 4 Core Pillars of African Speech AI (Borderless Cards) ── */}
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
            {[
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
            ].map(({ icon: Icon, color, title, desc, badge }) => (
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

      {/* ── Architecture & Framework ── */}
      <section className="py-24 bg-[#0b101c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 text-sm font-semibold">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Contract-Verified Pipelines</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Stop rewriting.
                <br />
                Start composing.
              </h2>
              <p className="text-slate-200 text-lg sm:text-xl leading-relaxed">
                LingualDub decomposes monolithic speech workflows into standardized, replaceable
                modules. Connect Sunbird AI, MMS-TTS, CTranslate2, and Whisper without rewriting pipeline glue.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  'Assemble-time contract checking prevents incompatible audio formats',
                  'Cryptographic voice donor sovereignty hashes prevent unauthorized cloning',
                  'Pluggable backend adapters for both cloud APIs and offline GGUF inference',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-base text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/architecture"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all text-base shadow-lg shadow-indigo-600/25"
                >
                  <span>Inspect Architecture</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/abstractions"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-slate-200 bg-white/[0.08] hover:bg-white/[0.14] transition-all text-base"
                >
                  <span>Core Abstractions</span>
                </Link>
              </div>
            </div>

            {/* Architecture Code/Terminal Snippet */}
            <div className="bg-[#050811] rounded-3xl p-7 sm:p-8 shadow-2xl font-mono text-sm sm:text-base">
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-slate-400">pipeline_definition.yaml</span>
              </div>
              <pre className="text-slate-300 overflow-x-auto space-y-1 leading-relaxed">
                <code>
                  <span className="text-slate-500"># LingualDub Sovereign Voice Pipeline</span>{'\n'}
                  <span className="text-purple-400">pipeline</span>:{'\n'}
                  {'  '}<span className="text-indigo-400">id</span>: <span className="text-emerald-300">"uganda-clinical-triage-v1"</span>{'\n'}
                  {'  '}<span className="text-indigo-400">source_dialect</span>: <span className="text-emerald-300">"lug-UG"</span>{'\n'}
                  {'  '}<span className="text-indigo-400">asr</span>: <span className="text-amber-300">"sunbird/asr-lug-small"</span>{'\n'}
                  {'  '}<span className="text-indigo-400">llm_dialogue</span>: <span className="text-amber-300">"duplex/barge-in-agent"</span>{'\n'}
                  {'  '}<span className="text-indigo-400">tts</span>:{'\n'}
                  {'    '}<span className="text-indigo-400">engine</span>: <span className="text-emerald-300">"sherpa-onnx/mms-tts-lug"</span>{'\n'}
                  {'    '}<span className="text-indigo-400">quantization</span>: <span className="text-emerald-300">"int8"</span>{'\n'}
                  {'    '}<span className="text-indigo-400">donor_consent_hash</span>: <span className="text-emerald-300">"0x98f4a2..."</span>{'\n'}
                  {'  '}<span className="text-indigo-400">mastering</span>: <span className="text-purple-300">"ebu_r128_-14lufs"</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Call to Action ── */}
      <section className="py-24 bg-[#070b14] text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Build Sovereign African Speech AI?
          </h2>
          <p className="text-slate-200 text-lg sm:text-xl leading-relaxed">
            Jump directly into the interactive studio or explore developer documentation to wire your own models.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer text-base"
            >
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Launch Voice Studio</span>
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] transition-all cursor-pointer text-base"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Documentation</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
