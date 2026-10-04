import React, { useState } from 'react';
import { Volume2, Check, Copy, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../CustomSelect';
import { AFRICAN_LANGUAGE_GROUPS } from '../lab/labConfig';

interface DubbingTargetCardProps {
  targetText: string;
  onTargetTextChange: (val: string) => void;
  targetLang: string;
  onTargetLangChange: (lang: string) => void;
  wordCount: number;
  syllableCount: number;
  recommendedSpeed: string;
  onAudition: () => void;
  isPlayingAudio: boolean;
}

export default function DubbingTargetCard({
  targetText,
  onTargetTextChange,
  targetLang,
  onTargetLangChange,
  wordCount,
  syllableCount,
  recommendedSpeed,
  onAudition,
  isPlayingAudio,
}: DubbingTargetCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-black text-white tracking-wide">
              Dubbed Target Dialogue
            </h2>
          </div>
          <div className="text-sm sm:text-base font-mono font-medium text-slate-300">
            {wordCount} words • {syllableCount} syllables
          </div>
        </div>

        {/* Target Language Dropdown */}
        <div className="space-y-2">
          <label htmlFor="dub-tgt-lang" className="text-base font-bold text-slate-200 block">
            Target African Language
          </label>
          <CustomSelect
            id="dub-tgt-lang"
            value={targetLang}
            onChange={onTargetLangChange}
            groups={AFRICAN_LANGUAGE_GROUPS}
          />
        </div>

        {/* Target Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="dub-tgt-text" className="text-base font-bold text-slate-200 block">
              Translated African Dialogue
            </label>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Script</span>
                </>
              )}
            </button>
          </div>
          <textarea
            id="dub-tgt-text"
            rows={6}
            value={targetText}
            onChange={(e) => onTargetTextChange(e.target.value)}
            className="w-full bg-[#070b14] rounded-2xl p-6 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed transition-colors resize-y min-h-[180px]"
            placeholder="Translated dialogue will appear here..."
          />
        </div>
      </div>

      {/* Target Actions Cluster */}
      <div className="flex items-center gap-3.5 pt-2">
        <button
          type="button"
          onClick={onAudition}
          disabled={!targetText.trim() || isPlayingAudio}
          className={`flex-1 h-15 px-6 rounded-2xl text-base font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce text-white' : 'text-indigo-400'}`} />
          <span>{isPlayingAudio ? 'Auditioning Speech...' : 'Audition Dub'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            navigate(
              `/studio?lang=${targetLang}&text=${encodeURIComponent(
                targetText
              )}&speed=${recommendedSpeed}`
            );
          }}
          disabled={!targetText.trim()}
          className="flex-1 h-15 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
          title="Send translated script and recommended speed into Speech Lab"
        >
          <span>Send to Speech Lab</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
