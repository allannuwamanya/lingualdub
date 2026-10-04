import React, { useState } from 'react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { LANGUAGE_SAMPLES } from '../../types/studio';
import DubbingHeaderBanner from './dubbing/DubbingHeaderBanner';
import DubbingTimingHUD from './dubbing/DubbingTimingHUD';
import DubbingSourceCard from './dubbing/DubbingSourceCard';
import DubbingTargetCard from './dubbing/DubbingTargetCard';
import { translateDialogue } from './dubbing/dubbingService';

export default function DubbingRoom() {
  const { sunbirdApiKey, speakBrowserVoice } = useStudioAudio();

  const [dubSrcText, setDubSrcText] = useState(
    'Welcome to our modern healthcare service. Please sit down while we register your information.'
  );
  const [dubSrcLang, setDubSrcLang] = useState('eng');
  const [dubTgtLang, setDubTgtLang] = useState('lug');
  const [dubTranslated, setDubTranslated] = useState(
    "Tukusanyukidde mu buweereza bwaffe obw'obulamu obw'omulembe. Mwatuula wansi nga tukyusa amawulire gammwe."
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Syllable counting heuristic for Bantu, Nilotic, and Latin-script languages
  const countSyllables = (text: string): number => {
    if (!text.trim()) return 0;
    const words = text.toLowerCase().split(/\s+/);
    let total = 0;
    for (const word of words) {
      const matches = word.match(/[aeiouyàáâãäåèéêëìíîïòóôõöùúûü]/gi);
      total += matches ? matches.length : 1;
    }
    return total;
  };

  const dubSrcWords = dubSrcText.trim() ? dubSrcText.trim().split(/\s+/).length : 0;
  const dubTgtWords = dubTranslated.trim() ? dubTranslated.trim().split(/\s+/).length : 0;

  const srcSyllables = countSyllables(dubSrcText);
  const tgtSyllables = countSyllables(dubTranslated);

  // Typical speaking rate: ~4.2 syllables per second
  const srcEstDuration = srcSyllables > 0 ? (srcSyllables / 4.2).toFixed(1) : '0.0';
  const tgtEstDuration = tgtSyllables > 0 ? (tgtSyllables / 4.0).toFixed(1) : '0.0';

  const durationDiffSec = parseFloat(tgtEstDuration) - parseFloat(srcEstDuration);
  const durationRatio =
    parseFloat(srcEstDuration) > 0
      ? Math.round((parseFloat(tgtEstDuration) / parseFloat(srcEstDuration) - 1) * 100)
      : 0;

  const recommendedSpeed =
    parseFloat(srcEstDuration) > 0 && parseFloat(tgtEstDuration) > 0
      ? (parseFloat(tgtEstDuration) / parseFloat(srcEstDuration)).toFixed(2)
      : '1.00';

  const handleSwapLanguages = () => {
    const tempLang = dubSrcLang;
    setDubSrcLang(dubTgtLang);
    setDubTgtLang(tempLang);

    const tempText = dubSrcText;
    setDubSrcText(dubTranslated);
    setDubTranslated(tempText);
  };

  const handleTranslate = async () => {
    if (!dubSrcText.trim()) return;
    setIsTranslating(true);
    try {
      const result = await translateDialogue({
        text: dubSrcText,
        sourceLang: dubSrcLang,
        targetLang: dubTgtLang,
        apiKey: sunbirdApiKey,
      });
      setDubTranslated(result);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAuditionTranslated = () => {
    if (!dubTranslated.trim()) return;
    setIsPlayingAudio(true);
    speakBrowserVoice(dubTranslated, dubTgtLang, 'Female', 1.0);
    const durationMs = Math.max(parseFloat(tgtEstDuration) * 1000, 2500);
    setTimeout(() => setIsPlayingAudio(false), durationMs);
  };

  const handleLoadSample = () => {
    setDubSrcText(
      'Welcome to our modern healthcare service. Please sit down while we register your information.'
    );
    const sample = LANGUAGE_SAMPLES[dubTgtLang];
    if (sample) setDubTranslated(sample);
  };

  const handleClearAll = () => {
    setDubSrcText('');
    setDubTranslated('');
  };

  return (
    <div
      className="space-y-8 max-w-[1600px] mx-auto page-fade-in"
      role="region"
      aria-label="Dubbing and Speech-to-Speech Studio"
    >
      <DubbingHeaderBanner
        onLoadSample={handleLoadSample}
        onClearAll={handleClearAll}
      />

      <DubbingTimingHUD
        srcDuration={srcEstDuration}
        tgtDuration={tgtEstDuration}
        srcSyllables={srcSyllables}
        tgtSyllables={tgtSyllables}
        durationDiffSec={durationDiffSec}
        durationRatio={durationRatio}
        recommendedSpeed={recommendedSpeed}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <DubbingSourceCard
          sourceText={dubSrcText}
          onSourceTextChange={setDubSrcText}
          sourceLang={dubSrcLang}
          onSourceLangChange={setDubSrcLang}
          onSwapLanguages={handleSwapLanguages}
          wordCount={dubSrcWords}
          syllableCount={srcSyllables}
          onTranslate={handleTranslate}
          isTranslating={isTranslating}
        />

        <DubbingTargetCard
          targetText={dubTranslated}
          onTargetTextChange={setDubTranslated}
          targetLang={dubTgtLang}
          onTargetLangChange={setDubTgtLang}
          wordCount={dubTgtWords}
          syllableCount={tgtSyllables}
          recommendedSpeed={recommendedSpeed}
          onAudition={handleAuditionTranslated}
          isPlayingAudio={isPlayingAudio}
        />
      </div>
    </div>
  );
}
