import React from 'react';
import { Languages, ArrowLeftRight, RefreshCw, Globe } from 'lucide-react';

interface DubbingSourceCardProps {
  sourceText: string;
  onSourceTextChange: (val: string) => void;
  sourceLang: string;
  onSourceLangChange: (lang: string) => void;
  onSwapLanguages: () => void;
  wordCount: number;
  syllableCount: number;
  onTranslate: () => void;
  isTranslating: boolean;
}

export default function DubbingSourceCard({
  sourceText,
  onSourceTextChange,
  sourceLang,
  onSourceLangChange,
  onSwapLanguages,
  wordCount,
  syllableCount,
  onTranslate,
  isTranslating,
}: DubbingSourceCardProps) {
  return (
    <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
          <div className="flex items-center gap-2.5">
            <Languages className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Source Dialogue
            </h2>
          </div>
          <div className="text-sm font-mono text-slate-400">
            {wordCount} words • {syllableCount} syl
          </div>
        </div>

        {/* Language Selector + Swap Action */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="dub-src-lang" className="text-sm font-semibold text-slate-300 block mb-2">
              Source Spoken Language
            </label>
            <select
              id="dub-src-lang"
              value={sourceLang}
              onChange={(e) => onSourceLangChange(e.target.value)}
              className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-12 cursor-pointer"
            >
              <option value="eng">🇬🇧 English (Global)</option>
              <option value="fra">🇫🇷 French (Francophone Africa)</option>
              <option value="swa">🇰🇪 Kiswahili (East Africa)</option>
              <option value="lug">🇺🇬 Luganda (Central Uganda)</option>
              <option value="por">🇵🇹 Portuguese (Angola / Mozambique)</option>
              <option value="ara">🇪🇬 Arabic (North Africa)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onSwapLanguages}
            className="h-12 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Swap source and target dialogue"
            aria-label="Swap source and target languages"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold hidden sm:inline">Swap</span>
          </button>
        </div>

        {/* Text Area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="dub-src-text" className="text-sm font-semibold text-slate-300">
              Source Script Text
            </label>
            <span className="text-xs font-mono text-slate-400">
              {sourceText.length} characters
            </span>
          </div>
          <textarea
            id="dub-src-text"
            value={sourceText}
            onChange={(e) => onSourceTextChange(e.target.value)}
            rows={8}
            className="w-full bg-[#070b14] focus:ring-2 focus:ring-indigo-500/50 rounded-2xl p-5 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed font-sans scrollbar-thin resize-y"
            placeholder="Type or paste the original video dialogue to translate..."
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onTranslate}
        disabled={isTranslating || !sourceText.trim()}
        className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {isTranslating ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Translating via NLLB / Sunbird...</span>
          </>
        ) : (
          <>
            <Globe className="w-5 h-5" />
            <span>Run Translation Engine</span>
          </>
        )}
      </button>
    </div>
  );
}
