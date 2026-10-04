import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { VoiceOption } from '../../../types/studio';

interface SpeechControlsRackProps {
  selectedLang: string;
  onLangChange: (lang: string) => void;
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  selectedEngine: string;
  onEngineChange: (engine: string) => void;
  pacingSpeed: number;
  onPacingSpeedChange: (speed: number) => void;
  speechPitch: number;
  onSpeechPitchChange: (pitch: number) => void;
  voices: VoiceOption[];
  sunbirdApiKey: string;
}

export default function SpeechControlsRack({
  selectedLang,
  onLangChange,
  selectedVoice,
  onVoiceChange,
  selectedEngine,
  onEngineChange,
  pacingSpeed,
  onPacingSpeedChange,
  speechPitch,
  onSpeechPitchChange,
  voices,
  sunbirdApiKey,
}: SpeechControlsRackProps) {
  const engineHelp =
    selectedEngine === 'sunbird'
      ? sunbirdApiKey
        ? '✓ Sunbird Token Active'
        : '⚠️ No key set (uses browser fallback)'
      : selectedEngine === 'sherpa_mms'
      ? 'Offline INT8 local execution'
      : selectedEngine === 'omnivoice'
      ? 'GGUF quantized cloning'
      : 'Native Web Speech API';

  return (
    <div className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
          <SlidersHorizontal className="w-6 h-6 text-indigo-400" />
          <span>Voice & Engine Controls</span>
        </h2>
        <span className="w-3 h-3 rounded-full bg-emerald-400" title="Engine online" />
      </div>

      {/* Target Language Selection */}
      <div className="space-y-2">
        <label htmlFor="target-lang-select" className="text-base font-bold text-slate-200 block">
          African Language
        </label>
        <select
          id="target-lang-select"
          value={selectedLang}
          onChange={(e) => onLangChange(e.target.value)}
          className="w-full bg-[#070b14] rounded-2xl px-5 text-base sm:text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-14 cursor-pointer"
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
      <div className="space-y-2">
        <label htmlFor="speaker-persona-select" className="text-base font-bold text-slate-200 block">
          Speaker Persona
        </label>
        <select
          id="speaker-persona-select"
          value={selectedVoice}
          onChange={(e) => onVoiceChange(e.target.value)}
          className="w-full bg-[#070b14] rounded-2xl px-5 text-base sm:text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-14 cursor-pointer"
        >
          {voices.map((v) => (
            <option key={v.voice_id} value={v.voice_id}>
              {v.flag} {v.name} ({v.gender} • {v.dialect || v.language})
            </option>
          ))}
        </select>
      </div>

      {/* Inference Runtime Engine Selection */}
      <div className="space-y-2">
        <label htmlFor="runtime-engine-select" className="text-base font-bold text-slate-200 block">
          Inference Runtime Engine
        </label>
        <select
          id="runtime-engine-select"
          value={selectedEngine}
          onChange={(e) => onEngineChange(e.target.value)}
          className="w-full bg-[#070b14] rounded-2xl px-5 text-base sm:text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-14 cursor-pointer"
        >
          <option value="sunbird">☁️ Sunbird AI Regional Cloud (Production Neural Speech)</option>
          <option value="sherpa_mms">🚀 Local Sherpa-ONNX MMS-TTS (Local INT8, ~35MB RAM)</option>
          <option value="omnivoice">🧬 Local OmniVoice GGUF (Voice Cloning Q4_K_M)</option>
          <option value="browser">🗣️ Browser Neural Speech Engine (Instant Real Voice)</option>
        </select>

        <div className="mt-2 text-sm text-slate-400 flex items-center justify-between font-medium">
          <span>{engineHelp}</span>
          <span className="font-mono text-indigo-400 font-bold">16 kHz Mono</span>
        </div>
      </div>

      {/* Pacing Speed Slider */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <label htmlFor="pacing-speed-range" className="text-base font-bold text-slate-200">
            Pacing Speed
          </label>
          <span className="font-mono text-indigo-400 font-extrabold text-base">{pacingSpeed.toFixed(2)}x</span>
        </div>
        <input
          id="pacing-speed-range"
          type="range"
          min="0.75"
          max="1.50"
          step="0.05"
          value={pacingSpeed}
          onChange={(e) => onPacingSpeedChange(parseFloat(e.target.value))}
          className="w-full h-3 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-sm font-mono text-slate-400">
          <span>0.75x (Solemn)</span>
          <span>1.0x (Natural)</span>
          <span>1.5x (Fast)</span>
        </div>
      </div>

      {/* Pitch Modulation Slider */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <label htmlFor="pitch-modulation-range" className="text-base font-bold text-slate-200">
            Pitch & Melodic Inflection
          </label>
          <span className="font-mono text-indigo-400 font-extrabold text-base">
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
          onChange={(e) => onSpeechPitchChange(parseFloat(e.target.value))}
          className="w-full h-3 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-sm font-mono text-slate-400">
          <span>-20% (Baritone)</span>
          <span>Default</span>
          <span>+20% (Bright)</span>
        </div>
      </div>
    </div>
  );
}
