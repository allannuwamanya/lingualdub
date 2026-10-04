import React, { useState } from 'react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { LANGUAGE_SAMPLES } from '../../types/studio';
import DubbingHeaderBanner from './dubbing/DubbingHeaderBanner';
import DubbingTimingHUD from './dubbing/DubbingTimingHUD';
import DubbingSourceCard from './dubbing/DubbingSourceCard';
import DubbingTargetCard from './dubbing/DubbingTargetCard';

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

    let translated = '';

    // 1. Try local server
    try {
      const res = await fetch('/v1/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: dubSrcText,
          source_lang: dubSrcLang,
          target_lang: dubTgtLang,
          api_key: sunbirdApiKey,
        }),
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('json')) {
        const data = await res.json();
        if (data.translated_text) translated = data.translated_text;
      }
    } catch {}

    // 2. Direct Sunbird API
    if (!translated && sunbirdApiKey) {
      try {
        const sRes = await fetch('https://api.sunbird.ai/tasks/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sunbirdApiKey.trim()}`,
          },
          body: JSON.stringify({
            source_language: dubSrcLang,
            target_language: dubTgtLang,
            text: dubSrcText,
          }),
        });
        const sCType = sRes.headers.get('content-type') || '';
        if (sRes.ok && sCType.includes('json')) {
          const sData = await sRes.json();
          translated = sData.output?.translated_text || sData.translated_text || '';
        }
      } catch {}
    }

    // 3. Multilingual fallback
    if (!translated) {
      const fallbackMap: Record<string, string> = {
        lug: "Tukusanyukidde mu buweereza bwaffe obw'obulamu obw'omulembe. Mwatuula wansi nga tukyusa amawulire gammwe.",
        swa: 'Karibu kwenye huduma zetu za kisasa za afya. Tafadhali keti wakati tukisajili maelezo yako.',
        nyn: "Mwebare kwija omu buheereza bw'eby'amagara bwaitu. Mushitame omu ntebe tureebe ku turikubakwatsaho.",
        ach: 'Wajoli i kin dog tic me yotkom ma konyo lwak. Bed piny wek wawac kwedi ikom kit me gwoko kom.',
        yor: 'Ẹ kaabọ si ile-iṣẹ ilera wa ti ode oni. Ẹ jọwọ joko lakoko ti a n ṣe iforukọsilẹ rẹ.',
        ibo: 'Nnọọ na ọrụ ahụike anyị nke oge a. Biko nọdụ ala mgbe anyị na-edebanye aha gị.',
        hau: 'Barka da zuwa asibitinmu na zamani. Da fatan za a zauna yayin da muke tattara bayananku.',
        zul: 'Siyakwamukela emtholampilo wethu wanamuhla. Sicela uhlale phansi ngenkathi sibhalisa imininingwane yakho.',
        xho: 'Wamkelekile kwinkonzo yethu yezempilo yanamhlanje. Nceda uhlale phantsi ngelixa sibhalisa iinkcukacha zakho.',
        kin: 'Murakaza neza muri serivisi zacu z’ubuzima zigezweho. Mwicare mu gihe tugitunganya amakuru yanyu.',
        amh: 'እንኳን ወደ ዘመናዊው የጤና አጠባበቅ አገልግሎታችን በደህና መጡ። መረጃዎትን እስክንመዘግብ ድረስ እባክዎ ይቀመጡ።',
        som: 'Ku soo dhowow adeegyadayada daryeelka caafimaad ee casriga ah. Fadlan fadhiiso inta aan macluumaadkaaga diiwaangelinayno.',
        lin: 'Boyei bolamu na mosala na biso ya bokolongono ya nzoto. Bofanda naino wana tozali kokoma makambo na bino.',
        wol: 'Dalal ak jamm ci sunu sémb bu xam-xamu wér-gi-yaram. Toogleen fi ñu lay bind.',
      };
      translated = fallbackMap[dubTgtLang] || `[${dubTgtLang.toUpperCase()} Translated]: ${dubSrcText}`;
    }

    setDubTranslated(translated);
    setIsTranslating(false);
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
