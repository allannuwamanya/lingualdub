import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { DOMAIN_TEMPLATES, LANGUAGE_SAMPLES, PRESET_VOICES, NATIVE_LANG_NAMES } from '../../types/studio';
import type { VoiceOption } from '../../types/studio';

export default function SpeechLab() {
  const [searchParams] = useSearchParams();
  const {
    audioUrl,
    isPlaying,
    isSynthesizing,
    sunbirdApiKey,
    synthesizeSpeech,
    playTrack,
  } = useStudioAudio();

  const [selectedLang, setSelectedLang] = useState<string>(searchParams.get('lang') || 'lug');
  const [selectedVoice, setSelectedVoice] = useState<string>('kigozi_lug');
  const [selectedEngine, setSelectedEngine] = useState<string>('sunbird');
  const [pacingSpeed, setPacingSpeed] = useState<number>(parseFloat(searchParams.get('speed') || '1.0'));
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [speechText, setSpeechText] = useState<string>(
    searchParams.get('text') ||
      'Mwaniriziddwa mu buweereza bwaffe obw’obulamu obw’omulembe. Mwatuula wansi nga tukyusa amawulire gammwe.'
  );

  const [recentTakes, setRecentTakes] = useState<
    Array<{ id: string; url: string; voiceName: string; lang: string; timestamp: string; engine: string }>
  >([]);

  // Calculate live word & character stats
  const scriptWords = speechText.trim() ? speechText.trim().split(/\s+/).length : 0;
  const scriptChars = speechText.length;
  const estimatedDurationSec = scriptWords > 0 ? (scriptWords * 0.42 / pacingSpeed).toFixed(1) : '0.0';

  const voices: VoiceOption[] = PRESET_VOICES;

  const handleSynthesize = async () => {
    if (!speechText.trim()) return;
    const url = await synthesizeSpeech({
      text: speechText,
      voiceId: selectedVoice,
      language: selectedLang,
      engine: selectedEngine,
      speed: pacingSpeed,
      pitch: speechPitch,
    });

    if (url) {
      const voiceObj = voices.find((v) => v.voice_id === selectedVoice);
      const newTake = {
        id: Date.now().toString(),
        url,
        voiceName: voiceObj ? voiceObj.name : selectedVoice,
        lang: selectedLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: selectedEngine === 'sunbird' ? 'Sunbird Cloud' : 'Sherpa Edge',
      };
      setRecentTakes((prev) => [newTake, ...prev.slice(0, 4)]);
    }
  };

  const insertTag = (tag: string) => {
    setSpeechText((prev) => `${prev} ${tag} `);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto page-fade-in" role="region" aria-label="Speech Lab Studio">
      {/* ── Header Banner ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 sm:p-8 bg-[#101726] rounded-3xl shadow-xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Speech Lab</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 tracking-wide">
                Neural TTS
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 leading-relaxed">
              Synthesize natural, prosodic speech across Luganda, Runyankore, Swahili, Acholi, and 18+ African languages.
            </p>
          </div>
        </div>

        {/* Quick Domain Script Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Presets:
          </span>
          {DOMAIN_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => setSpeechText(tmpl.text)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white transition-colors shrink-0 cursor-pointer min-h-[40px]"
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2-Column Balanced DAW Workstation ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Script Editor + Acoustic Waveform Canvas */}
        <div className="xl:col-span-8 space-y-6">
          {/* 1. Script Editor Card */}
          <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.05] pb-4">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-white tracking-wide">Script Editor</span>
                <div className="flex items-center gap-2 text-sm font-mono text-slate-400">
                  <span>{scriptWords} words</span>
                  <span>•</span>
                  <span>{scriptChars} chars</span>
                  <span>•</span>
                  <span className="text-indigo-300 font-semibold">~{estimatedDurationSec}s est. duration</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSpeechText(LANGUAGE_SAMPLES[selectedLang] || '')}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Regional Sample</span>
              </button>
            </div>

            {/* Prosodic Tags */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                  Prosodic Expression & Emotion Cues
                </label>
                <span className="text-xs text-slate-500">Click to insert cue</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { tag: '[excited]', desc: 'High energy & pitch' },
                  { tag: '[whisper]', desc: 'Intimate breathy tone' },
                  { tag: '[respectful]', desc: 'Elder / formal greeting' },
                  { tag: '[sorrow]', desc: 'Mournful inflection' },
                  { tag: '[pause: 500ms]', desc: 'Half-second break' },
                  { tag: '[formal]', desc: 'Broadcast news tone' },
                  { tag: '[urgent]', desc: 'Emergency advisory' },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => insertTag(item.tag)}
                    title={item.desc}
                    className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-colors shadow-sm cursor-pointer"
                  >
                    {item.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Script Textarea */}
            <div>
              <textarea
                value={speechText}
                onChange={(e) => setSpeechText(e.target.value)}
                rows={8}
                className="w-full bg-[#070b14] focus:ring-2 focus:ring-indigo-500/40 rounded-2xl p-5 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed font-sans transition-colors resize-y min-h-[200px]"
                placeholder="Enter speech script to synthesize across African languages..."
              />
            </div>

            {/* Primary Action Button - Clean, Solid Indigo */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              <button
                type="button"
                onClick={handleSynthesize}
                disabled={isSynthesizing || !speechText.trim()}
                className="w-full sm:flex-1 h-13 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Synthesizing Authentic Voice Track...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Generate Voice Track</span>
                  </>
                )}
              </button>

              {audioUrl && (
                <a
                  href={audioUrl}
                  download={`lingualdub_${selectedVoice}_${selectedLang}.wav`}
                  className="w-full sm:w-auto h-13 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>Download WAV</span>
                </a>
              )}
            </div>
          </div>

          {/* 2. Interactive Acoustic Waveform Monitor & Track Canvas */}
          <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span className="text-base font-bold text-white tracking-wide">
                  Acoustic Audio Monitor & Waveform Canvas
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {audioUrl ? 'Track Active' : 'Standby Mode'}
              </span>
            </div>

            {/* Waveform Canvas Simulation */}
            <div className="p-6 bg-[#070b14] rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2 text-slate-300 font-semibold">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
                  {isPlaying ? 'Playing Real-time Acoustic Waveform' : 'Ready to Audition'}
                </span>
                <span className="font-mono">{audioUrl ? '16,000 Hz Mono PCM' : 'No Signal'}</span>
              </div>

              {/* 64-Band Interactive Amplitude Wave Bars */}
              <div className="h-28 flex items-center justify-between gap-1 px-3 py-2 bg-black/60 rounded-xl overflow-hidden">
                {Array.from({ length: 56 }).map((_, i) => {
                  const seed = Math.sin(i * 0.22) * 40 + Math.cos(i * 0.45) * 35 + 45;
                  const barHeight = isPlaying ? Math.max(12, seed % 95) : 12;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-150 ${
                        isPlaying
                          ? 'bg-indigo-500'
                          : 'bg-slate-800'
                      }`}
                      style={{
                        height: `${barHeight}%`,
                        opacity: isPlaying ? 0.9 : 0.4,
                      }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
                <span>00:00</span>
                <span>Stereo Phase Normal</span>
                <span>{estimatedDurationSec}s</span>
              </div>
            </div>

            {/* Recent Takes Rack */}
            {recentTakes.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Recent Generation Takes (A/B Audition):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentTakes.map((take) => (
                    <div
                      key={take.id}
                      className="p-4 bg-[#070b14] rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate text-sm">{take.voiceName}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {take.engine} • {take.lang.toUpperCase()} • {take.timestamp}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playTrack(take.url, take.voiceName, take.lang, take.engine)}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
              <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                Voice & Engine Rack
              </h2>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Engine online" />
            </div>

            {/* Target Language */}
            <div>
              <label htmlFor="target-lang-select" className="text-sm font-medium text-slate-300 block mb-2">
                Target African Language
              </label>
              <select
                id="target-lang-select"
                value={selectedLang}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setSelectedLang(newLang);
                  const matching = voices.filter((v) => v.language === newLang);
                  if (matching.length > 0) setSelectedVoice(matching[0].voice_id);
                }}
                className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 h-12"
              >
                <option value="lug">🇺🇬 Luganda (Uganda)</option>
                <option value="nyn">🇺🇬 Runyankore (Uganda)</option>
                <option value="ach">🇺🇬 Acholi (Uganda)</option>
                <option value="swa">🇰🇪 Swahili (East Africa)</option>
                <option value="yor">🇳🇬 Yoruba (Nigeria)</option>
                <option value="ibo">🇳🇬 Igbo (Nigeria)</option>
                <option value="hau">🇳🇬 Hausa (Nigeria / Sahel)</option>
                <option value="zul">🇿🇦 isiZulu (South Africa)</option>
                <option value="xho">🇿🇦 isiXhosa (South Africa)</option>
                <option value="kin">🇷🇼 Kinyarwanda (Rwanda)</option>
                <option value="amh">🇪🇹 Amharic (Ethiopia)</option>
                <option value="som">🇸🇴 Somali (Horn of Africa)</option>
                <option value="lin">🇨🇩 Lingala (DR Congo)</option>
                <option value="wol">🇸🇳 Wolof (Senegal)</option>
              </select>
            </div>

            {/* Speaker Persona */}
            <div>
              <label htmlFor="speaker-persona-select" className="text-sm font-medium text-slate-300 block mb-2">
                Speaker Persona
              </label>
              <select
                id="speaker-persona-select"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 h-12"
              >
                {voices.map((v) => (
                  <option key={v.voice_id} value={v.voice_id}>
                    {v.flag} {v.name} ({v.gender} • {v.dialect || v.language})
                  </option>
                ))}
              </select>
            </div>

            {/* Inference Runtime */}
            <div>
              <label htmlFor="runtime-engine-select" className="text-sm font-medium text-slate-300 block mb-2">
                Inference Runtime Engine
              </label>
              <select
                id="runtime-engine-select"
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 h-12"
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
                      ? '✓ Sunbird Token active'
                      : '⚠️ No key set (uses browser fallback)'
                    : selectedEngine === 'sherpa_mms'
                    ? 'Edge INT8 offline'
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
                <label htmlFor="pacing-speed-range" className="text-sm font-medium text-slate-300">
                  Pacing Speed
                </label>
                <span className="font-mono text-indigo-400 font-bold text-sm">{pacingSpeed}x</span>
              </div>
              <input
                id="pacing-speed-range"
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={pacingSpeed}
                onChange={(e) => setPacingSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400 mt-1">
                <span>0.75x (Solemn)</span>
                <span>1.0x (Natural)</span>
                <span>1.5x (Fast)</span>
              </div>
            </div>

            {/* Pitch Modulation */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="pitch-modulation-range" className="text-sm font-medium text-slate-300">
                  Pitch & Melodic Inflection
                </label>
                <span className="font-mono text-indigo-400 font-bold text-sm">
                  {speechPitch > 1.0 ? `+${Math.round((speechPitch - 1) * 100)}%` : `${Math.round((speechPitch - 1) * 100)}%`}
                </span>
              </div>
              <input
                id="pitch-modulation-range"
                type="range"
                min="0.8"
                max="1.2"
                step="0.02"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400 mt-1">
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
