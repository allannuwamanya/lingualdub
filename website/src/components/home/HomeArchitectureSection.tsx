import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

const HIGHLIGHTS = [
  'Assemble-time contract checking prevents incompatible audio formats',
  'Cryptographic voice donor sovereignty hashes prevent unauthorized cloning',
  'Pluggable backend adapters for both cloud APIs and offline GGUF inference',
];

export default function HomeArchitectureSection() {
  return (
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
              {HIGHLIGHTS.map((item, idx) => (
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
  );
}
