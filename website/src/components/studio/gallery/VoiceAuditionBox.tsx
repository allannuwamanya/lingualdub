import React, { useState } from 'react';
import { Languages, Copy, Check } from 'lucide-react';

interface VoiceAuditionBoxProps {
  nativeText: string;
  phonetics?: string;
  englishText: string;
}

export default function VoiceAuditionBox({
  nativeText,
  phonetics,
  englishText,
}: VoiceAuditionBoxProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPhrase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(nativeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="bg-[#070b14] rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-300 font-semibold">
        <span className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-indigo-400" />
          <span>Audition Script</span>
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyPhrase}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Copy audition script"
            aria-label="Copy audition script"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setShowTranslation(!showTranslation)}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-bold cursor-pointer underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {showTranslation ? 'Hide English' : 'Show English'}
          </button>
        </div>
      </div>

      <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-medium">
        &ldquo;{nativeText}&rdquo;
      </p>

      {phonetics && (
        <p className="text-sm text-indigo-300 font-mono italic">
          {phonetics}
        </p>
      )}

      {showTranslation && (
        <div className="pt-3 mt-2 border-t border-white/[0.06] text-sm sm:text-base text-slate-300 leading-relaxed">
          <span className="text-slate-400 font-semibold">Translation: </span>
          &ldquo;{englishText}&rdquo;
        </div>
      )}
    </div>
  );
}
