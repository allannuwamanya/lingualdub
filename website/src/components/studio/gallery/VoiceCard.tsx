import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  ArrowRight,
  Activity,
  Copy,
  Check,
  Languages,
  Sparkles,
  Trash2,
  Share2,
} from 'lucide-react';
import type { VoiceOption } from '../../../types/studio';
import { NATIVE_LANG_NAMES } from '../../../types/studio';
import { getVoiceGreeting } from './galleryData';

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
  const [showTranslation, setShowTranslation] = useState(false);
  const [copied, setCopied] = useState(false);

  const nativeName = NATIVE_LANG_NAMES[voice.language];
  const greeting = getVoiceGreeting(voice.language, voice.name);
  const isCloned = voice.isCloned || voice.voice_id.startsWith('clone_');

  const handleCopyPhrase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(greeting.native);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <article
      aria-label={`Voice profile: ${voice.name}`}
      className={`bg-[#101726] hover:bg-[#141c30] rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all group ${
        isPlaying ? 'ring-2 ring-indigo-500/70 bg-[#141d33]' : ''
      }`}
    >
      <div className="space-y-4">
        {/* ── Top Bar: Flag, Language, Tags ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl leading-none" role="img" aria-label={`Flag of ${voice.country || 'Africa'}`}>
              {voice.flag || (isCloned ? '🧬' : '🌍')}
            </span>
            <div>
              <span className="text-sm font-bold text-white block">
                {nativeName || voice.country || 'African Voice'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {voice.country || 'Regional'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isCloned && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Custom Clone
              </span>
            )}
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-white/[0.06] text-slate-200 uppercase">
              {voice.language}
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
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
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">
              {voice.name}
            </h3>
            {isPlaying && (
              <span className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 font-semibold shrink-0">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Auditioning</span>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-300 mt-1">
            {voice.dialect || 'Native Authentic African Dialect'}
          </p>
        </div>

        {/* ── Native Phrase Audition Box ── */}
        <div className="bg-[#070b14] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span>Audition Script</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPhrase}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="Copy audition script"
                aria-label="Copy audition script"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold cursor-pointer underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {showTranslation ? 'Hide English' : 'Show English'}
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            &ldquo;{greeting.native}&rdquo;
          </p>

          {greeting.phonetics && (
            <p className="text-xs text-indigo-300/80 font-mono italic">
              {greeting.phonetics}
            </p>
          )}

          {showTranslation && (
            <div className="pt-2 mt-2 border-t border-white/[0.06] text-xs text-slate-400 leading-normal">
              <span className="text-slate-500 font-medium">Translation: </span>
              &ldquo;{greeting.english}&rdquo;
            </div>
          )}
        </div>

        {/* ── Audio Engine & Quality Metadata ── */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
          <span>{voice.sampleRate || '16-24 kHz Mono PCM'}</span>
          <span className="text-slate-500">
            {isCloned ? '192-d ECAPA' : voice.language === 'lug' ? 'Sunbird Neural' : 'Sherpa INT8'}
          </span>
        </div>
      </div>

      {/* ── Animated Waveform Bars during Playback ── */}
      {isPlaying && (
        <div className="flex items-center justify-center gap-1 py-3 my-2" aria-hidden="true">
          {[40, 70, 90, 60, 100, 75, 45, 85, 95, 55, 75, 40].map((height, i) => (
            <span
              key={i}
              className="w-1 bg-indigo-500 rounded-full animate-pulse"
              style={{
                height: `${Math.max(8, (height * 24) / 100)}px`,
                animationDelay: `${i * 70}ms`,
                animationDuration: '600ms',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Bottom Action Row ── */}
      <div className="flex items-center gap-3 mt-6 pt-2">
        {/* Audition Button */}
        <button
          type="button"
          onClick={onAudition}
          className={`flex-1 min-h-[46px] px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isPlaying
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-200'
          }`}
          aria-label={isPlaying ? `Pause voice ${voice.name}` : `Audition voice ${voice.name}`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
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
          className="flex-1 min-h-[46px] px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20 focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={`Use ${voice.name} in Speech Lab`}
        >
          <span>Use in Lab</span>
          <ArrowRight className="w-4 h-4" />
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
            className="p-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer min-h-[46px] min-w-[46px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-rose-500"
            title="Delete custom voice clone"
            aria-label={`Delete custom voice ${voice.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </article>
  );
}
