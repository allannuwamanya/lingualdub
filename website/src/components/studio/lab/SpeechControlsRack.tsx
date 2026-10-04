import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { VoiceOption } from '../../../types/studio';
import CustomSelect, { type SelectOption } from '../CustomSelect';
import { AFRICAN_LANGUAGE_GROUPS, INFERENCE_ENGINE_OPTIONS } from './labConfig';

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

  const voiceOptions: SelectOption[] = voices.map((v) => ({
    value: v.voice_id,
    label: v.name,
    flag: v.flag,
    description: `${v.gender} • ${v.dialect || v.language}`,
    badge: v.gender,
  }));

  return (
    <div className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
          <SlidersHorizontal className="w-6 h-6 text-indigo-400" />
          <span>Voice & Engine Controls</span>
        </h2>
        <span className="w-3 h-3 rounded-full bg-emerald-400" title="Engine online" />
      </div>

      {/* Target Language Selection with Custom Select */}
      <div className="space-y-2">
        <label className="text-base font-bold text-slate-200 block">
          African Language
        </label>
        <CustomSelect
          value={selectedLang}
          onChange={onLangChange}
          groups={AFRICAN_LANGUAGE_GROUPS}
          placeholder="Select an African language..."
          ariaLabel="Target African Language"
        />
      </div>

      {/* Speaker Persona Selection with Custom Select */}
      <div className="space-y-2">
        <label className="text-base font-bold text-slate-200 block">
          Speaker Persona
        </label>
        <CustomSelect
          value={selectedVoice}
          onChange={onVoiceChange}
          options={voiceOptions}
          placeholder="Select speaker persona..."
          ariaLabel="Speaker Persona"
        />
      </div>

      {/* Inference Runtime Engine Selection with Custom Select */}
      <div className="space-y-2">
        <label className="text-base font-bold text-slate-200 block">
          Inference Runtime Engine
        </label>
        <CustomSelect
          value={selectedEngine}
          onChange={onEngineChange}
          options={INFERENCE_ENGINE_OPTIONS}
          placeholder="Select inference engine..."
          ariaLabel="Inference Runtime Engine"
        />

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
