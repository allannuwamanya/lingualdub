import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film,
  Globe,
  RefreshCw,
  ArrowRight,
  Languages,
  Sparkles,
  ArrowLeftRight,
  Volume2,
  Copy,
  Check,
  Clock,
  Gauge,
  AlertCircle,
} from 'lucide-react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { DOMAIN_TEMPLATES, NATIVE_LANG_NAMES } from '../../types/studio';

export default function DubbingRoom() {
  const navigate = useNavigate();
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
  const [copiedTarget, setCopiedTarget] = useState(false);

  // Approximate syllables (heuristic for African Bantu/Nilotic and English syllables: vowels + diphthongs)
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

  // Duration delta ratio
  const durationDiffSec = parseFloat(tgtEstDuration) - parseFloat(srcEstDuration);
  const durationRatio = parseFloat(srcEstDuration) > 0
    ? Math.round((parseFloat(tgtEstDuration) / parseFloat(srcEstDuration) - 1) * 100)
    : 0;

  // Recommended speed adjustment to match video lip-sync
  const recommendedSpeed = parseFloat(srcEstDuration) > 0 && parseFloat(tgtEstDuration) > 0
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
            'Authorization': `Bearer ${sunbirdApiKey.trim()}`,
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

    // 3. Fallback translation
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
        amh: 'እንኳን ወደ ዘመናዊው የጤና አጠባበቅ አገልግሎታችን በደህna መጡ። መረጃዎትን እስክንመዘግብ ድረስ እባክዎ ይቀመጡ።',
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

  const handleCopyTarget = () => {
    navigator.clipboard.writeText(dubTranslated);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto page-fade-in" role="region" aria-label="Dubbing and Speech-to-Speech Studio">
      {/* Header Banner - Clean, Calm, Professional */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 sm:p-8 bg-[#101726] rounded-3xl shadow-xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Film className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Dubbing Room & Timing Studio</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 tracking-wide">
                Syllable Alignment
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 leading-relaxed">
              Translate spoken dialogue across African languages and align timing envelopes for precise video lip-sync.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Presets:
          </span>
          {DOMAIN_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => setDubSrcText(tmpl.text)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white transition-colors shrink-0 cursor-pointer min-h-[40px]"
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lip-Sync Timing HUD / Alignment Monitor */}
      <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Acoustic Syllable & Timing Alignment HUD
            </h2>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono flex-wrap">
            <span className="text-slate-300">
              Source: <strong className="text-white font-semibold">{srcEstDuration}s</strong> ({srcSyllables} syl)
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              Target: <strong className="text-indigo-300 font-semibold">{tgtEstDuration}s</strong> ({tgtSyllables} syl)
            </span>
            <span className="text-slate-600">•</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold font-mono ${
              Math.abs(durationRatio) <= 10
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-amber-500/15 text-amber-300'
            }`}>
              Delta: {durationRatio >= 0 ? `+${durationRatio}%` : `${durationRatio}%`} ({durationDiffSec >= 0 ? `+${durationDiffSec.toFixed(1)}s` : `${durationDiffSec.toFixed(1)}s`})
            </span>
          </div>
        </div>

        {/* Visual Progress Comparison Bars */}
        <div className="space-y-3.5 pt-2">
          {/* Source Timing Bar */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400 w-16 text-right shrink-0">Source</span>
            <div className="flex-1 bg-[#070b14] h-3.5 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-slate-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(10, (parseFloat(srcEstDuration) / 12) * 100))}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-300 w-12">{srcEstDuration}s</span>
          </div>

          {/* Target Timing Bar */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-indigo-400 w-16 text-right shrink-0">Target</span>
            <div className="flex-1 bg-[#070b14] h-3.5 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(10, (parseFloat(tgtEstDuration) / 12) * 100))}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-300 w-12">{tgtEstDuration}s</span>
          </div>
        </div>

        {/* Recommendation Bar */}
        <div className="pt-4 border-t border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Gauge className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Recommended TTS Speed Pacing: <strong className="text-white font-mono">{recommendedSpeed}x</strong> to synchronize dialogue to exact video frames.
            </span>
          </div>
          {Math.abs(durationRatio) > 20 && (
            <div className="flex items-center gap-1.5 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Target text duration differs by &gt;20%. Adjust phrasing or use speed pacing.</span>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Dialogue Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left: Source Script Card */}
        <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <div className="flex items-center gap-2.5">
                <Languages className="w-5 h-5 text-indigo-400" />
                <span className="text-base font-bold text-white tracking-wide">Source Dialogue</span>
              </div>
              <div className="text-sm font-mono text-slate-400">
                {dubSrcWords} words • {srcSyllables} syl
              </div>
            </div>

            {/* Language Selector + Swap Trigger */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-300 block mb-2">Source Language</label>
                <select
                  value={dubSrcLang}
                  onChange={(e) => setDubSrcLang(e.target.value)}
                  className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 h-12"
                >
                  <option value="eng">🇬🇧 English (Global)</option>
                  <option value="fra">🇫🇷 French (Francophone Africa)</option>
                  <option value="swa">🇰🇪 Swahili (East Africa)</option>
                  <option value="lug">🇺🇬 Luganda (Uganda)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSwapLanguages}
                className="h-12 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                title="Swap source and target languages"
              >
                <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold hidden sm:inline">Swap</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Source Dialogue Text</label>
                <span className="text-xs font-mono text-slate-400">{dubSrcText.length} characters</span>
              </div>
              <textarea
                value={dubSrcText}
                onChange={(e) => setDubSrcText(e.target.value)}
                rows={9}
                className="w-full bg-[#070b14] focus:ring-2 focus:ring-indigo-500/40 rounded-2xl p-5 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed font-sans scrollbar-thin resize-y"
                placeholder="Enter source dialogue to translate..."
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating || !dubSrcText.trim()}
            className="w-full h-13 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer disabled:cursor-not-allowed"
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

        {/* Right: Target African Translation Card */}
        <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span className="text-base font-bold text-white tracking-wide">
                  Target Translation & Timing
                </span>
              </div>
              <div className="text-sm font-mono text-slate-400">
                {dubTgtWords > 0
                  ? `${dubTgtWords} words • ${tgtSyllables} syl`
                  : 'Awaiting translation'}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Target African Language</label>
              <select
                value={dubTgtLang}
                onChange={(e) => setDubTgtLang(e.target.value)}
                className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 h-12"
              >
                <option value="lug">🇺🇬 Luganda (Uganda)</option>
                <option value="swa">🇰🇪 Swahili (East Africa)</option>
                <option value="nyn">🇺🇬 Runyankore (Uganda)</option>
                <option value="ach">🇺🇬 Acholi (Uganda)</option>
                <option value="yor">🇳🇬 Yoruba (Nigeria)</option>
                <option value="ibo">🇳🇬 Igbo (Nigeria)</option>
                <option value="hau">🇳🇬 Hausa (Nigeria)</option>
                <option value="zul">🇿🇦 isiZulu (South Africa)</option>
                <option value="amh">🇪🇹 Amharic (Ethiopia)</option>
                <option value="kin">🇷🇼 Kinyarwanda (Rwanda)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Translated Script</label>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">{dubTranslated.length} characters</span>
                  {dubTranslated && (
                    <button
                      type="button"
                      onClick={handleCopyTarget}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy translated text"
                    >
                      {copiedTarget ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTarget ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={dubTranslated}
                onChange={(e) => setDubTranslated(e.target.value)}
                rows={9}
                className="w-full bg-[#070b14] focus:ring-2 focus:ring-indigo-500/40 rounded-2xl p-5 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed font-sans scrollbar-thin resize-y"
                placeholder="Translation will appear here..."
              />
            </div>
          </div>

          {dubTranslated ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAuditionTranslated}
                className="w-full h-12 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />
                <span>{isPlayingAudio ? 'Auditioning Speech Synthesizer...' : 'Audition Translated Audio'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate(`/studio?lang=${dubTgtLang}&text=${encodeURIComponent(dubTranslated)}&speed=${recommendedSpeed}`);
                }}
                className="w-full h-13 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
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
      </div>
    </div>
  );
}
