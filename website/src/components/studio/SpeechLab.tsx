import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  Volume2,
  RefreshCw,
  Sparkles,
  Download,
  SlidersHorizontal,
  Wand2,
  Layers,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Sliders,
  Trash2,
  Music2,
  Film,
} from 'lucide-react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { LANGUAGE_SAMPLES, PRESET_VOICES, formatTime } from '../../types/studio';
import type { VoiceOption } from '../../types/studio';

export default function SpeechLab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    replayAudio,
    seekAudio,
    sunbirdApiKey,
    synthesizeAudioTrack,
    playTrack,
    audioTrackName,
  } = useStudioAudio();

  const [selectedLang, setSelectedLang] = useState<string>(searchParams.get('lang') || 'lug');
  const [selectedVoice, setSelectedVoice] = useState<string>(searchParams.get('voice') || 'kigozi_lug');
  const [selectedEngine, setSelectedEngine] = useState<string>('sunbird');
  const [pacingSpeed, setPacingSpeed] = useState<number>(parseFloat(searchParams.get('speed') || '1.0'));
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const [speechText, setSpeechText] = useState<string>(
    searchParams.get('text') ||
      'Mwaniriziddwa mu buweereza bwaffe obw’obulamu obw’omulembe. Mwatuula wansi nga tukyusa amawulire gammwe.'
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [recentTakes, setRecentTakes] = useState<
    Array<{ id: string; url: string; voiceName: string; lang: string; timestamp: string; engine: string; duration: number }>
  >([]);

  // Calculate live word & character stats
  const scriptWords = speechText.trim() ? speechText.trim().split(/\s+/).length : 0;
  const scriptChars = speechText.length;
  const estimatedDurationSec = scriptWords > 0 ? (scriptWords * 0.42 / pacingSpeed).toFixed(1) : '0.0';

  const voices: VoiceOption[] = PRESET_VOICES;
  const currentVoiceObj = voices.find((v) => v.voice_id === selectedVoice) || voices[0];

  const handleSynthesize = async () => {
    if (!speechText.trim() || isSynthesizing) return;
    setIsSynthesizing(true);

    try {
      const res = await synthesizeAudioTrack({
        text: speechText,
        voiceId: selectedVoice,
        language: selectedLang,
        engine: selectedEngine,
        speed: pacingSpeed,
      });

      if (res.url) {
        const newTake = {
          id: Date.now().toString(),
          url: res.url,
          voiceName: currentVoiceObj.name,
          lang: selectedLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          engine: selectedEngine === 'sunbird' ? 'Sunbird Cloud' : selectedEngine === 'sherpa_mms' ? 'Sherpa INT8' : 'Browser Engine',
          duration: parseFloat(estimatedDurationSec),
        };
        setRecentTakes((prev) => [newTake, ...prev.slice(0, 3)]);
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  const insertTextAtCursor = (insertion: string) => {
    if (!textareaRef.current) {
      setSpeechText((prev) => `${prev} ${insertion} `);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const updated = current.substring(0, start) + insertion + current.substring(end);
    setSpeechText(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekAudio(ratio * duration);
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto page-fade-in" role="region" aria-label="Speech Lab Studio">
      {/* ── Header Banner (Clean, Focused, No Canned Presets) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 sm:p-8 bg-[#101726] rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Speech Lab</h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 uppercase tracking-wider">
                {currentVoiceObj.flag} {selectedLang.toUpperCase()} • {currentVoiceObj.name}
              </span>
            </div>
            <p className="text-base text-slate-300 mt-1 leading-relaxed">
              Synthesize neural speech, adjust prosodic inflection, and audition phonetics across African languages.
            </p>
          </div>
        </div>

        {/* Live Engine Status Badge */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#070b14] text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {selectedEngine === 'sunbird'
                ? sunbirdApiKey
                  ? 'Sunbird Cloud API'
                  : 'Sunbird (Browser Fallback)'
                : selectedEngine === 'sherpa_mms'
                ? 'Sherpa-ONNX INT8'
                : 'Web Speech API'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400">16 kHz Mono</span>
          </div>
        </div>
      </div>

      {/* ── 2-Column DAW Workstation ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Script Editor + Audio Player + Takes */}
        <div className="xl:col-span-8 space-y-6">
          {/* 1. Script Editor Card */}
          <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.05] pb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white tracking-wide">Script Editor</span>
                <div className="flex items-center gap-2 text-sm font-mono text-slate-400">
                  <span>{scriptWords} words</span>
                  <span>•</span>
                  <span>{scriptChars} chars</span>
                  <span>•</span>
                  <span className="text-indigo-300 font-semibold">~{estimatedDurationSec}s est.</span>
                </div>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSpeechText('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-white/[0.04] transition-colors cursor-pointer"
                  title="Clear text area"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechText(LANGUAGE_SAMPLES[selectedLang] || '')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-white/[0.04] transition-colors cursor-pointer"
                  title="Reset to sample sentence in current language"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Language Sample</span>
                </button>
              </div>
            </div>

            {/* Phonetic Diacritics & Expression Tag Strip */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>African Phonetics & Prosodic Cues</span>
                </label>
                <span className="text-xs text-slate-500">Click to insert at cursor</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Diacritics */}
                <div className="flex items-center gap-1 bg-[#070b14] p-1 rounded-xl">
                  {['ŋ', 'ŋŋ', 'ny', 'á', 'à', 'ā', 'ẹ', 'ọ', 'ṣ'].map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => insertTextAtCursor(char)}
                      className="w-8 h-8 rounded-lg text-sm font-semibold font-mono text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center cursor-pointer"
                      title={`Insert ${char}`}
                    >
                      {char}
                    </button>
                  ))}
                </div>

                {/* Expression / Pause Tags */}
                <div className="flex items-center gap-1 bg-[#070b14] p-1 rounded-xl flex-wrap">
                  {[
                    { tag: '[pause: 300ms]', label: '300ms' },
                    { tag: '[pause: 600ms]', label: '600ms' },
                    { tag: '[emphasis: strong]', label: 'Emphasis' },
                    { tag: '[whisper]', label: 'Whisper' },
                    { tag: '[excited]', label: 'Excited' },
                    { tag: '[respectful]', label: 'Respectful' },
                  ].map(({ tag, label }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTextAtCursor(` ${tag} `)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
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
                onChange={(e) => setSpeechText(e.target.value)}
                rows={8}
                className="w-full bg-[#070b14] focus:ring-2 focus:ring-indigo-500/40 rounded-2xl p-5 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed font-sans transition-colors resize-y min-h-[200px]"
                placeholder="Type or paste your script in Luganda, Swahili, Runyankore, Yoruba, or any African language..."
              />
            </div>

            {/* Generate Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSynthesize}
                disabled={isSynthesizing || !speechText.trim()}
                className="w-full h-14 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Synthesizing Voice Track...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Generate Voice Track</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Interactive Audio Monitor & Player */}
          <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Acoustic Audio Monitor
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {audioUrl ? 'Signal Ready' : 'Standby'}
              </span>
            </div>

            {/* Monitor Box */}
            <div className="p-6 bg-[#070b14] rounded-2xl space-y-5">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span className="flex items-center gap-2 text-slate-200 font-semibold">
                  <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-indigo-400 animate-pulse' : audioUrl ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  {isPlaying ? 'Playing Audio Signal' : audioUrl ? audioTrackName || 'Voice Track Loaded' : 'Awaiting Synthesis'}
                </span>
                <span className="font-mono text-xs">{audioUrl ? '16 kHz Mono PCM' : 'No Signal'}</span>
              </div>

              {/* Waveform Visualization */}
              <div className="h-28 flex items-center justify-between gap-1 px-4 py-2 bg-black/60 rounded-xl overflow-hidden">
                {Array.from({ length: 56 }).map((_, i) => {
                  const seed = Math.sin(i * 0.22) * 40 + Math.cos(i * 0.45) * 35 + 45;
                  const barHeight = isPlaying ? Math.max(15, seed % 95) : audioUrl ? 24 : 10;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-150 ${
                        isPlaying
                          ? 'bg-indigo-500'
                          : audioUrl
                          ? 'bg-indigo-900/60'
                          : 'bg-slate-800/60'
                      }`}
                      style={{
                        height: `${barHeight}%`,
                        opacity: isPlaying ? 0.95 : 0.4,
                      }}
                    />
                  );
                })}
              </div>

              {/* Scrubbable Timeline */}
              <div className="space-y-1.5">
                <div
                  onClick={handleProgressClick}
                  className="h-3 bg-white/[0.06] hover:bg-white/[0.1] rounded-full cursor-pointer relative overflow-hidden transition-colors"
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-75"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || parseFloat(estimatedDurationSec))}</span>
                </div>
              </div>

              {/* Player Transport Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={replayAudio}
                    disabled={!audioUrl}
                    className="w-11 h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-30 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                    title="Replay from start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlayPause}
                    disabled={!audioUrl}
                    className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Play Audio</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Workflow Actions */}
                {audioUrl && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={audioUrl}
                      download={`lingualdub_${selectedVoice}_${selectedLang}.wav`}
                      className="h-11 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
                      title="Download audio WAV"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Export WAV</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => navigate('/mastering')}
                      className="h-11 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      title="Send to Mastering Rack for broadcast LUFS leveling"
                    >
                      <Music2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>To Mastering</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/dubbing?lang=${selectedLang}&text=${encodeURIComponent(speechText)}`)}
                      className="h-11 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      title="Send to Lip-Sync Dubbing Room"
                    >
                      <Film className="w-3.5 h-3.5 text-indigo-400" />
                      <span>To Dubbing</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Recent Takes Comparison Rack */}
            {recentTakes.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recent Generation Takes (A/B Audition):
                  </span>
                  <button
                    type="button"
                    onClick={() => setRecentTakes([])}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Clear Takes
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentTakes.map((take, idx) => (
                    <div
                      key={take.id}
                      className="p-4 bg-[#070b14] rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 font-mono text-[10px]">
                            Take {idx + 1}
                          </span>
                          <p className="font-bold text-white truncate text-sm">{take.voiceName}</p>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          {take.engine} • {take.lang.toUpperCase()} • ~{take.duration}s
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => playTrack(take.url, take.voiceName, take.lang, take.engine)}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Audition</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Acoustic Parameter Rack */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                <span>Voice & Engine Controls</span>
              </h2>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Engine online" />
            </div>

            {/* Target Language Selection */}
            <div>
              <label htmlFor="target-lang-select" className="text-sm font-semibold text-slate-200 block mb-2">
                African Language
              </label>
              <select
                id="target-lang-select"
                value={selectedLang}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setSelectedLang(newLang);
                  const matching = voices.filter((v) => v.language === newLang);
                  if (matching.length > 0) setSelectedVoice(matching[0].voice_id);
                  if (LANGUAGE_SAMPLES[newLang]) setSpeechText(LANGUAGE_SAMPLES[newLang]);
                }}
                className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 h-12 cursor-pointer"
              >
                <optgroup label="🇺🇬 Uganda">
                  <option value="lug">Luganda (Central)</option>
                  <option value="nyn">Runyankore-Rukiga (Western)</option>
                  <option value="ach">Acholi (Northern)</option>
                </optgroup>
                <optgroup label="🇰🇪 East Africa">
                  <option value="swa">Kiswahili (East Africa)</option>
                  <option value="kin">Kinyarwanda (Rwanda)</option>
                  <option value="som">Somali (Horn of Africa)</option>
                </optgroup>
                <optgroup label="🇳🇬 West Africa">
                  <option value="yor">Èdè Yorùbá (Nigeria)</option>
                  <option value="ibo">Asụsụ Igbo (Nigeria)</option>
                  <option value="hau">Harshen Hausa (Nigeria / Sahel)</option>
                  <option value="wol">Wolof (Senegal)</option>
                </optgroup>
                <optgroup label="🇿🇦 Southern Africa">
                  <option value="zul">isiZulu (South Africa)</option>
                  <option value="xho">isiXhosa (South Africa)</option>
                </optgroup>
                <optgroup label="🇪🇹 Horn & Central">
                  <option value="amh">Amharic (Ethiopia)</option>
                  <option value="lin">Lingala (DR Congo)</option>
                </optgroup>
              </select>
            </div>

            {/* Speaker Persona Selection */}
            <div>
              <label htmlFor="speaker-persona-select" className="text-sm font-semibold text-slate-200 block mb-2">
                Speaker Persona
              </label>
              <select
                id="speaker-persona-select"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 h-12 cursor-pointer"
              >
                {voices.map((v) => (
                  <option key={v.voice_id} value={v.voice_id}>
                    {v.flag} {v.name} ({v.gender} • {v.dialect || v.language})
                  </option>
                ))}
              </select>
            </div>

            {/* Inference Runtime Engine Selection */}
            <div>
              <label htmlFor="runtime-engine-select" className="text-sm font-semibold text-slate-200 block mb-2">
                Inference Runtime Engine
              </label>
              <select
                id="runtime-engine-select"
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 h-12 cursor-pointer"
              >
                <option value="sunbird">☁️ Sunbird AI Regional Cloud (Production Neural Speech)</option>
                <option value="sherpa_mms">🚀 Local Sherpa-ONNX MMS-TTS (Local INT8, ~35MB RAM)</option>
                <option value="omnivoice">🧬 Local OmniVoice GGUF (Voice Cloning Q4_K_M)</option>
                <option value="browser">🗣️ Browser Neural Speech Engine (Instant Real Voice)</option>
              </select>

              <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>
                  {selectedEngine === 'sunbird'
                    ? sunbirdApiKey
                      ? '✓ Sunbird Token Active'
                      : '⚠️ No key set (uses browser fallback)'
                    : selectedEngine === 'sherpa_mms'
                    ? 'Offline INT8 local execution'
                    : selectedEngine === 'omnivoice'
                    ? 'GGUF quantized cloning'
                    : 'Native Web Speech API'}
                </span>
                <span className="font-mono text-indigo-400">16 kHz Mono</span>
              </div>
            </div>

            {/* Pacing Speed Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="pacing-speed-range" className="text-sm font-semibold text-slate-200">
                  Pacing Speed
                </label>
                <span className="font-mono text-indigo-400 font-bold text-sm">{pacingSpeed.toFixed(2)}x</span>
              </div>
              <input
                id="pacing-speed-range"
                type="range"
                min="0.75"
                max="1.50"
                step="0.05"
                value={pacingSpeed}
                onChange={(e) => setPacingSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400 mt-1.5">
                <span>0.75x (Solemn)</span>
                <span>1.0x (Natural)</span>
                <span>1.5x (Fast)</span>
              </div>
            </div>

            {/* Pitch Modulation Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="pitch-modulation-range" className="text-sm font-semibold text-slate-200">
                  Pitch & Melodic Inflection
                </label>
                <span className="font-mono text-indigo-400 font-bold text-sm">
                  {speechPitch > 1.0 ? `+${Math.round((speechPitch - 1) * 100)}%` : `${Math.round((speechPitch - 1) * 100)}%`}
                </span>
              </div>
              <input
                id="pitch-modulation-range"
                type="range"
                min="0.80"
                max="1.20"
                step="0.02"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400 mt-1.5">
                <span>-20% (Baritone)</span>
                <span>Default</span>
                <span>+20% (Bright)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
