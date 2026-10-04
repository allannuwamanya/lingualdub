import React from 'react';
import { Languages, ArrowLeftRight, RefreshCw } from 'lucide-react';
import CustomSelect, { type SelectOption } from '../CustomSelect';

const DUBBING_SOURCE_LANGS: SelectOption[] = [
  { value: 'eng', label: 'English (Global)', flag: '🇬🇧', description: 'Global Lingua Franca' },
  { value: 'fra', label: 'French (Francophone Africa)', flag: '🇫🇷', description: 'West & Central Africa' },
  { value: 'swa', label: 'Kiswahili (East Africa)', flag: '🇰🇪', description: 'Regional Lingua Franca' },
  { value: 'lug', label: 'Luganda (Central Uganda)', flag: '🇺🇬', description: 'Central Buganda Dialect' },
  { value: 'por', label: 'Portuguese (Angola / Mozambique)', flag: '🇵🇹', description: 'Lusophone Africa' },
  { value: 'ara', label: 'Arabic (North Africa)', flag: '🇪🇬', description: 'Maghreb & Nile' },
];

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
    <div className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-3">
            <Languages className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-black text-white tracking-wide">
              Source Dialogue
            </h2>
          </div>
          <div className="text-sm sm:text-base font-mono font-medium text-slate-300">
            {wordCount} words • {syllableCount} syllables
          </div>
        </div>

        {/* Language Selector + Swap Action */}
        <div className="flex items-end gap-3.5">
          <div className="flex-1 space-y-2">
            <label className="text-base font-bold text-slate-200 block">
              Source Spoken Language
            </label>
            <CustomSelect
              value={sourceLang}
              onChange={onSourceLangChange}
              options={DUBBING_SOURCE_LANGS}
              placeholder="Select source language..."
              ariaLabel="Source Spoken Language"
            />
          </div>

          <button
            type="button"
            onClick={onSwapLanguages}
            className="w-14 h-14 rounded-2xl bg-[#070b14] hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500 border border-white/[0.08]"
            title="Swap source and target dialogue"
            aria-label="Swap source and target languages"
          >
            <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
          </button>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label htmlFor="dub-src-text" className="text-base font-bold text-slate-200 block">
            Original Script / Transcript
          </label>
          <textarea
            id="dub-src-text"
            rows={6}
            value={sourceText}
            onChange={(e) => onSourceTextChange(e.target.value)}
            className="w-full bg-[#070b14] rounded-2xl p-6 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed transition-colors resize-y min-h-[180px]"
            placeholder="Enter the source spoken dialogue..."
          />
        </div>
      </div>

      {/* Translate Action CTA */}
      <button
        type="button"
        onClick={onTranslate}
        disabled={isTranslating || !sourceText.trim()}
        className="w-full h-15 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
      >
        {isTranslating ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Translating Dialogue...</span>
          </>
        ) : (
          <>
            <Languages className="w-5 h-5" />
            <span>Translate & Calculate Timing</span>
          </>
        )}
      </button>
    </div>
  );
}
