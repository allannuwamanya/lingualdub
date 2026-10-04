import React from 'react';
import { Volume2, RefreshCw, Wand2, Trash2 } from 'lucide-react';

interface SpeechScriptEditorProps {
  speechText: string;
  onSpeechTextChange: (text: string) => void;
  selectedLang: string;
  pacingSpeed: number;
  isSynthesizing: boolean;
  onSynthesize: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onInsertText: (text: string) => void;
  onResetSample: () => void;
}

export default function SpeechScriptEditor({
  speechText,
  onSpeechTextChange,
  selectedLang,
  pacingSpeed,
  isSynthesizing,
  onSynthesize,
  textareaRef,
  onInsertText,
  onResetSample,
}: SpeechScriptEditorProps) {
  const scriptWords = speechText.trim() ? speechText.trim().split(/\s+/).length : 0;
  const scriptChars = speechText.length;
  const estimatedDurationSec = scriptWords > 0 ? ((scriptWords * 0.42) / pacingSpeed).toFixed(1) : '0.0';

  const DIACRITIC_CHARS = ['ŋ', 'ŋŋ', 'ny', 'á', 'à', 'ā', 'ẹ', 'ọ', 'ṣ'];
  const EXPRESSION_TAGS = [
    { tag: '[pause: 300ms]', label: '300ms Pause' },
    { tag: '[pause: 600ms]', label: '600ms Pause' },
    { tag: '[emphasis: strong]', label: 'Emphasis' },
    { tag: '[whisper]', label: 'Whisper' },
    { tag: '[excited]', label: 'Excited' },
    { tag: '[respectful]', label: 'Respectful' },
  ];

  return (
    <div className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-black text-white tracking-wide">Script Editor</span>
          <div className="flex items-center gap-2.5 text-sm sm:text-base font-mono text-slate-300">
            <span>{scriptWords} words</span>
            <span className="text-slate-600">•</span>
            <span>{scriptChars} chars</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-300 font-bold">~{estimatedDurationSec}s estimated</span>
          </div>
        </div>

        {/* Clear & Sample Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSpeechTextChange('')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-slate-300 hover:text-rose-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Clear text area"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
          <button
            type="button"
            onClick={onResetSample}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 transition-colors cursor-pointer"
            title="Load sample sentence in current language"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Language Sample</span>
          </button>
        </div>
      </div>

      {/* Phonetic Diacritics & Expression Tag Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-400" />
            <span>African Phonetics & Prosodic Cues</span>
          </label>
          <span className="text-xs sm:text-sm text-slate-400">Click to insert at cursor</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Diacritics */}
          <div className="flex items-center gap-1.5 bg-[#070b14] p-1.5 rounded-2xl">
            {DIACRITIC_CHARS.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => onInsertText(char)}
                className="h-10 min-w-10 px-2 rounded-xl text-base font-bold font-mono text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center cursor-pointer"
                title={`Insert ${char}`}
              >
                {char}
              </button>
            ))}
          </div>

          {/* Expression / Pause Tags */}
          <div className="flex items-center gap-1.5 bg-[#070b14] p-1.5 rounded-2xl flex-wrap">
            {EXPRESSION_TAGS.map(({ tag, label }) => (
              <button
                key={tag}
                type="button"
                onClick={() => onInsertText(` ${tag} `)}
                className="h-10 px-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                title={`Insert ${tag}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Script Textarea */}
      <div>
        <textarea
          ref={textareaRef}
          value={speechText}
          onChange={(e) => onSpeechTextChange(e.target.value)}
          rows={8}
          className="w-full bg-[#070b14] focus:ring-2 focus:ring-indigo-500/50 rounded-2xl p-6 text-lg sm:text-xl text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed font-sans transition-colors resize-y min-h-[220px]"
          placeholder="Type or paste your script in Luganda, Swahili, Runyankore, Yoruba, or any African language..."
        />
      </div>

      {/* Primary Synthesize CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSynthesize}
          disabled={isSynthesizing || !speechText.trim()}
          className="w-full h-16 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-extrabold rounded-2xl text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/25 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
        >
          {isSynthesizing ? (
            <>
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Synthesizing Voice Track...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-6 h-6" />
              <span>Generate Voice Track</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
