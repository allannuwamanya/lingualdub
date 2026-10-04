import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Copy, Check, Volume2, ArrowRight } from 'lucide-react';

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
    <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Target Translation & Timing
            </h2>
          </div>
          <div className="text-sm font-mono text-slate-400">
            {wordCount > 0 ? `${wordCount} words • ${syllableCount} syl` : 'Awaiting translation'}
          </div>
        </div>

        {/* Target Language Selector with all 14 African Languages */}
        <div>
          <label htmlFor="dub-tgt-lang" className="text-sm font-semibold text-slate-300 block mb-2">
            Target African Language
          </label>
          <select
            id="dub-tgt-lang"
            value={targetLang}
            onChange={(e) => onTargetLangChange(e.target.value)}
            className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-12 cursor-pointer"
          >
            <optgroup label="🇺🇬 Uganda">
              <option value="lug">🇺🇬 Luganda (Central Uganda)</option>
              <option value="nyn">🇺🇬 Runyankore (Western Uganda)</option>
              <option value="ach">🇺🇬 Acholi (Northern Luo)</option>
            </optgroup>
            <optgroup label="🇰🇪🇷🇼 East Africa">
              <option value="swa">🇰🇪 Kiswahili (East Africa)</option>
              <option value="kin">🇷🇼 Kinyarwanda (Rwanda)</option>
            </optgroup>
            <optgroup label="🇳🇬🇸🇳 West Africa">
              <option value="yor">🇳🇬 Yoruba (Nigeria)</option>
              <option value="ibo">🇳🇬 Igbo (Nigeria)</option>
              <option value="hau">🇳🇬 Hausa (Nigeria)</option>
              <option value="wol">🇸🇳 Wolof (Senegal)</option>
            </optgroup>
            <optgroup label="🇿🇦 Southern Africa">
              <option value="zul">🇿🇦 isiZulu (South Africa)</option>
              <option value="xho">🇿🇦 isiXhosa (South Africa)</option>
            </optgroup>
            <optgroup label="🇪🇹🇸🇴 Horn of Africa">
              <option value="amh">🇪🇹 Amharic (Ethiopia)</option>
              <option value="som">🇸🇴 Af-Soomaali (Somalia)</option>
            </optgroup>
            <optgroup label="🇨🇩 Central Africa">
              <option value="lin">🇨🇩 Lingala (DR Congo)</option>
            </optgroup>
          </select>
        </div>

        {/* Translated Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="dub-tgt-text" className="text-sm font-semibold text-slate-300">
              Translated Script
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                {targetText.length} characters
              </span>
              {targetText && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1"
                  title="Copy translated text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>
          <textarea
            id="dub-tgt-text"
            value={targetText}
            onChange={(e) => onTargetTextChange(e.target.value)}
            rows={8}
            className="w-full bg-[#070b14] focus:ring-2 focus:ring-indigo-500/50 rounded-2xl p-5 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed font-sans scrollbar-thin resize-y"
            placeholder="Translation will appear here..."
          />
        </div>
      </div>

      {/* Downstream Actions */}
      {targetText.trim() ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={onAudition}
            className="w-full h-12 bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-indigo-400 animate-pulse' : 'text-slate-300'}`} />
            <span>{isPlayingAudio ? 'Auditioning Spoken Audio...' : 'Audition Translated Audio'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigate(
                `/studio?lang=${targetLang}&text=${encodeURIComponent(targetText)}&speed=${recommendedSpeed}`
              );
            }}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <ArrowRight className="w-5 h-5 text-indigo-200" />
            <span>Send to Speech Lab (with {recommendedSpeed}x pacing)</span>
          </button>
        </div>
      ) : (
        <div className="py-14 text-center text-sm text-slate-400 bg-[#070b14] rounded-2xl">
          Run translation engine above to generate African dialogue and verify lip-sync timing.
        </div>
      )}
    </div>
  );
}
