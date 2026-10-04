import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowRight, Activity, Sparkles, Trash2 } from 'lucide-react';
import type { VoiceOption } from '../../../types/studio';
import { NATIVE_LANG_NAMES } from '../../../types/studio';
import { getVoiceGreeting } from './galleryData';
import VoiceAuditionBox from './VoiceAuditionBox';

interface VoiceCardProps {
  voice: VoiceOption;
  isPlaying: boolean;
  onAudition: () => void;
  onDeleteClone?: (voiceId: string) => void;
}

export default function VoiceCard({
  voice,
  isPlaying,
  onAudition,
  onDeleteClone,
}: VoiceCardProps) {
  const navigate = useNavigate();

  const nativeName = NATIVE_LANG_NAMES[voice.language];
  const greeting = getVoiceGreeting(voice.language, voice.name);
  const isCloned = voice.isCloned || voice.voice_id.startsWith('clone_');

  return (
    <article
      aria-label={`Voice profile: ${voice.name}`}
      className={`bg-[#101726] hover:bg-[#141d30] rounded-3xl p-7 sm:p-8 shadow-xl flex flex-col justify-between transition-all group ${
        isPlaying ? 'ring-2 ring-indigo-500/70 bg-[#141d33]' : ''
      }`}
    >
      <div className="space-y-5">
        {/* ── Top Bar: Flag, Language, Tags ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="text-4xl leading-none" role="img" aria-label={`Flag of ${voice.country || 'Africa'}`}>
              {voice.flag || (isCloned ? '🧬' : '🌍')}
            </span>
            <div>
              <span className="text-lg font-extrabold text-white block tracking-tight">
                {nativeName || voice.country || 'African Voice'}
              </span>
              <span className="text-sm text-slate-300 font-mono mt-0.5 block">
                {voice.country || 'Regional'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isCloned && (
              <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Custom Clone
              </span>
            )}
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-white/[0.06] text-slate-200 uppercase tracking-wide">
              {voice.language}
            </span>
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                voice.gender === 'Female'
                  ? 'bg-purple-500/15 text-purple-300'
                  : 'bg-indigo-500/15 text-indigo-300'
              }`}
            >
              {voice.gender === 'Female' ? 'Female ♀' : 'Male ♂'}
            </span>
          </div>
        </div>

        {/* ── Speaker Name & Dialect ── */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-2xl font-extrabold text-white group-hover:text-indigo-200 transition-colors tracking-tight">
              {voice.name}
            </h3>
            {isPlaying && (
              <span className="flex items-center gap-1.5 text-sm font-mono text-indigo-400 font-bold shrink-0">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Auditioning</span>
              </span>
            )}
          </div>
          <p className="text-base text-slate-200 font-medium mt-1">
            {voice.dialect || 'Native Authentic African Dialect'}
          </p>
        </div>

        {/* ── Native Phrase Audition Box (Modular Subcomponent) ── */}
        <VoiceAuditionBox
          nativeText={greeting.native}
          phonetics={greeting.phonetics}
          englishText={greeting.english}
        />

        {/* ── Audio Engine & Quality Metadata ── */}
        <div className="flex items-center justify-between text-sm text-slate-300 font-mono pt-1 font-medium">
          <span>{voice.sampleRate || '16-24 kHz Mono PCM'}</span>
          <span className="text-slate-400">
            {isCloned ? '192-d ECAPA' : voice.language === 'lug' ? 'Sunbird Neural' : 'Sherpa INT8'}
          </span>
        </div>
      </div>

      {/* ── Animated Waveform Bars during Playback ── */}
      {isPlaying && (
        <div className="flex items-center justify-center gap-1.5 py-4 my-2" aria-hidden="true">
          {[40, 70, 90, 60, 100, 75, 45, 85, 95, 55, 75, 40].map((height, i) => (
            <span
              key={i}
              className="w-1.5 bg-indigo-500 rounded-full animate-pulse"
              style={{
                height: `${Math.max(10, (height * 28) / 100)}px`,
                animationDelay: `${i * 70}ms`,
                animationDuration: '600ms',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Bottom Action Row ── */}
      <div className="flex items-center gap-3 mt-7 pt-2">
        {/* Audition Button */}
        <button
          type="button"
          onClick={onAudition}
          className={`flex-1 h-14 px-5 rounded-2xl text-base font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isPlaying
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white'
          }`}
          aria-label={isPlaying ? `Pause voice ${voice.name}` : `Audition voice ${voice.name}`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 fill-white" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Audition</span>
            </>
          )}
        </button>

        {/* Primary 'Use in Lab' Button */}
        <button
          type="button"
          onClick={() => {
            navigate(`/studio?lang=${voice.language}&voice=${voice.voice_id}&text=${encodeURIComponent(greeting.native)}`);
          }}
          className="flex-1 h-14 px-5 rounded-2xl text-base font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/25 focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={`Use ${voice.name} in Speech Lab`}
        >
          <span>Use in Lab</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Delete Clone Action (Only for custom clones) */}
        {isCloned && onDeleteClone && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete cloned voice profile "${voice.name}"?`)) {
                onDeleteClone(voice.voice_id);
              }
            }}
            className="h-14 w-14 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-2xl transition-colors cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-2 focus-visible:ring-rose-500"
            title="Delete custom voice clone"
            aria-label={`Delete custom voice ${voice.name}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </article>
  );
}
