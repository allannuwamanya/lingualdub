import React from 'react';
import { Mic } from 'lucide-react';

interface SpeechLabHeaderProps {
  currentVoiceName: string;
  currentVoiceFlag: string;
  selectedLang: string;
  selectedEngine: string;
  sunbirdApiKey: string;
}

export default function SpeechLabHeader({
  currentVoiceName,
  currentVoiceFlag,
  selectedLang,
  selectedEngine,
  sunbirdApiKey,
}: SpeechLabHeaderProps) {
  const engineLabel =
    selectedEngine === 'sunbird'
      ? sunbirdApiKey
        ? 'Sunbird Cloud API'
        : 'Sunbird (Browser Fallback)'
      : selectedEngine === 'sherpa_mms'
      ? 'Sherpa-ONNX INT8'
      : selectedEngine === 'omnivoice'
      ? 'OmniVoice GGUF'
      : 'Web Speech API';

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 sm:p-9 bg-[#101726] rounded-3xl shadow-xl">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Mic className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Speech Lab</h1>
            <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-indigo-500/15 text-indigo-300 uppercase tracking-wider">
              {currentVoiceFlag} {selectedLang.toUpperCase()} • {currentVoiceName}
            </span>
          </div>
          <p className="text-base sm:text-lg text-slate-300 mt-2 leading-relaxed max-w-3xl">
            Synthesize neural speech, adjust prosodic inflection, and audition phonetics across African languages.
          </p>
        </div>
      </div>

      {/* Live Engine Status Badge */}
      <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#070b14] text-sm font-mono text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">{engineLabel}</span>
          <span className="text-slate-600">•</span>
          <span className="text-indigo-400 font-bold">16 kHz Mono</span>
        </div>
      </div>
    </div>
  );
}
