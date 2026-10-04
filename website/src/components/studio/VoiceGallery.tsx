import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Volume2,
  Dna,
  X,
  Activity,
} from 'lucide-react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { PRESET_VOICES, NATIVE_LANG_NAMES } from '../../types/studio';
import type { VoiceOption } from '../../types/studio';

export default function VoiceGallery() {
  const navigate = useNavigate();
  const {
    clonedVoices,
    audioTrackName,
    isPlaying,
    playTrack,
    togglePlayPause,
    speakBrowserVoice,
  } = useStudioAudio();

  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceFilter, setVoiceFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Female' | 'Male'>('all');

  const allVoices: VoiceOption[] = useMemo(() => {
    return [...clonedVoices, ...PRESET_VOICES];
  }, [clonedVoices]);

  const filteredVoices = useMemo(() => {
    return allVoices.filter((v) => {
      const q = voiceQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.language.toLowerCase().includes(q) ||
        (v.dialect && v.dialect.toLowerCase().includes(q)) ||
        (v.country && v.country.toLowerCase().includes(q)) ||
        (NATIVE_LANG_NAMES[v.language] && NATIVE_LANG_NAMES[v.language].toLowerCase().includes(q));

      const matchesRegion =
        voiceFilter === 'all' ||
        (voiceFilter === 'ug' && (v.language === 'lug' || v.language === 'nyn' || v.language === 'ach')) ||
        (voiceFilter === 'ea' && (v.language === 'swa' || v.language === 'kin' || v.language === 'som')) ||
        (voiceFilter === 'ng' && (v.language === 'yor' || v.language === 'ibo' || v.language === 'hau')) ||
        (voiceFilter === 'za' && (v.language === 'zul' || v.language === 'xho')) ||
        (voiceFilter === 'et' && v.language === 'amh');

      const matchesGender = genderFilter === 'all' || v.gender === genderFilter;

      return matchesQuery && matchesRegion && matchesGender;
    });
  }, [allVoices, voiceQuery, voiceFilter, genderFilter]);

  const auditionVoice = (voice: VoiceOption) => {
    const demoPhrases: Record<string, string> = {
      lug: 'Oli otya nnyabo! Ndi mubeezi wo mu LingualDub.',
      swa: 'Habari yako! Karibu kwenye mfumo wa sauti.',
      yor: 'Ẹ ku ojumo! Eyi ni ohun adayeba ti ode oni.',
      ibo: 'Nnọọ! Nke a bụ olu sitere na ala anyị.',
      hau: 'Barka da rana! Wannan muryar zamani ce.',
      zul: 'Sawubona! Leli yizwi lendabuko lanamuhla.',
      amh: 'እንኳን ደህና መጡ! ይህ የአማርኛ ድምጽ ማስተካከያ ነው።',
      nyn: 'Mwebare kwija! Ndi omubeezi wawe omu Runyankore.',
      ach: 'Wajoli! Man obedo dwon me Leb Acoli.',
    };

    const text =
      demoPhrases[voice.language] ||
      `Hello! I am ${voice.name}, ready to voice your content with native African cadence.`;

    speakBrowserVoice(text, voice.language, voice.gender, 1.0);
  };

  const clearAllFilters = () => {
    setVoiceQuery('');
    setVoiceFilter('all');
    setGenderFilter('all');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto page-fade-in" role="region" aria-label="African Voice Gallery">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">African Voice Gallery</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                {filteredVoices.length} of {allVoices.length} Personas
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Audition native speakers across East, West, Southern, Central, and Horn of Africa with authentic prosody.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/cloner')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
        >
          <Dna className="w-4 h-4" />
          <span>Clone Custom Voice</span>
        </button>
      </div>

      {/* ── Filter Toolbar (Clean, No Box-in-a-Box Clutter) ── */}
      <div className="bg-surface-card rounded-2xl p-5 shadow-daw space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={voiceQuery}
              onChange={(e) => setVoiceQuery(e.target.value)}
              placeholder="Search by name, dialect, country, or language..."
              className="w-full bg-[#070b14] rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors h-11"
            />
            {voiceQuery && (
              <button
                type="button"
                onClick={() => setVoiceQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Gender Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#070b14] p-1.5 rounded-xl w-full md:w-auto overflow-x-auto">
            {(['all', 'Female', 'Male'] as const).map((g) => {
              const active = genderFilter === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenderFilter(g)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {g === 'all' ? 'All Genders' : g === 'Female' ? 'Female ♀' : 'Male ♂'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Regional Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            Region:
          </span>
          {[
            { id: 'all', label: 'All Regions' },
            { id: 'ug', label: '🇺🇬 Uganda' },
            { id: 'ea', label: '🇰🇪 East Africa' },
            { id: 'ng', label: '🇳🇬 Nigeria' },
            { id: 'za', label: '🇿🇦 South Africa' },
            { id: 'et', label: '🇪🇹 Ethiopia' },
          ].map((rf) => {
            const active = voiceFilter === rf.id;
            return (
              <button
                key={rf.id}
                type="button"
                onClick={() => setVoiceFilter(rf.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {rf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Empty State ── */}
      {filteredVoices.length === 0 && (
        <div className="p-12 text-center bg-surface-card rounded-2xl shadow-daw space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Voices Found</h3>
            <p className="text-base text-slate-300 mt-1">
              No speaker personas match your current search query or regional filters.
            </p>
          </div>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base rounded-xl transition-colors cursor-pointer shadow-md"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* ── Voice Cards Grid ── */}
      {filteredVoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVoices.map((voice) => {
            const isCurrentAuditioning =
              audioTrackName.includes(voice.name) && isPlaying;
            const nativeName = NATIVE_LANG_NAMES[voice.language];

            return (
              <div
                key={voice.voice_id}
                className={`bg-[#121826] hover:bg-[#151d2f] rounded-2xl p-7 shadow-daw flex flex-col justify-between transition-all group ${
                  isCurrentAuditioning
                    ? 'ring-2 ring-indigo-500/50 bg-[#162035]'
                    : ''
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Flag + Native Name + Language/Gender Tags */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none" role="img" aria-label="Country flag">
                        {voice.flag || '🌍'}
                      </span>
                      {nativeName && (
                        <span className="text-sm font-semibold text-slate-200">
                          {nativeName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/[0.06] text-slate-200 font-semibold uppercase">
                        {voice.language}
                      </span>
                      <span className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 font-medium">
                        {voice.gender}
                      </span>
                    </div>
                  </div>

                  {/* Speaker Name and Dialect */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {voice.name}
                      </h3>
                      {isCurrentAuditioning && (
                        <span className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 font-semibold animate-pulse">
                          <Activity className="w-4 h-4" /> Playing
                        </span>
                      )}
                    </div>
                    <p className="text-base text-slate-300 mt-1">{voice.dialect || 'Native Regional Dialect'}</p>
                  </div>

                  {/* Country & Audio Quality Metadata */}
                  <div className="text-sm text-slate-400 flex items-center justify-between pt-1 font-mono">
                    <span>{voice.country || 'Africa'}</span>
                    <span className="text-slate-500">16-24 kHz Mono PCM</span>
                  </div>
                </div>

                {/* Bottom Action Row (Clean, Borderless Buttons) */}
                <div className="flex items-center gap-3 mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCurrentAuditioning) {
                        togglePlayPause();
                      } else {
                        auditionVoice(voice);
                      }
                    }}
                    className={`flex-1 h-12 px-4 rounded-xl text-base font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isCurrentAuditioning
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-200'
                    }`}
                    aria-label={`Audition voice ${voice.name}`}
                  >
                    {isCurrentAuditioning ? (
                      <>
                        <Pause className="w-4 h-4 text-white" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-slate-300" />
                        <span>Audition</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/studio?lang=${voice.language}&voice=${voice.voice_id}`);
                    }}
                    className="flex-1 h-12 px-4 rounded-xl text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                    aria-label={`Use voice ${voice.name} in Speech Lab`}
                  >
                    <span>Use in Lab</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
