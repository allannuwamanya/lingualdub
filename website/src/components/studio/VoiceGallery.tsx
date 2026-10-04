import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Dna } from 'lucide-react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { PRESET_VOICES, NATIVE_LANG_NAMES } from '../../types/studio';
import type { VoiceOption } from '../../types/studio';
import type { RegionFilterId } from './gallery/galleryData';
import { matchesRegionFilter } from './gallery/galleryData';
import VoiceGalleryFilterBar from './gallery/VoiceGalleryFilterBar';
import VoiceCard from './gallery/VoiceCard';
import VoiceGalleryEmptyState from './gallery/VoiceGalleryEmptyState';

export default function VoiceGallery() {
  const navigate = useNavigate();
  const {
    voices,
    clonedVoices,
    audioTrackName,
    isPlaying,
    togglePlayPause,
    auditionVoice,
    removeClonedVoice,
  } = useStudioAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<RegionFilterId>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'Female' | 'Male'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'lang' | 'country'>('default');

  // Combine cloned voices + system presets (deduplicating by voice_id)
  const allVoices: VoiceOption[] = useMemo(() => {
    const combined = [...(clonedVoices || []), ...(voices && voices.length > 0 ? voices : PRESET_VOICES)];
    const seen = new Set<string>();
    return combined.filter((v) => {
      if (seen.has(v.voice_id)) return false;
      seen.add(v.voice_id);
      return true;
    });
  }, [clonedVoices, voices]);

  // Filter and sort personas
  const filteredVoices = useMemo(() => {
    let result = allVoices.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.language.toLowerCase().includes(q) ||
        (v.dialect && v.dialect.toLowerCase().includes(q)) ||
        (v.country && v.country.toLowerCase().includes(q)) ||
        (NATIVE_LANG_NAMES[v.language] && NATIVE_LANG_NAMES[v.language].toLowerCase().includes(q));

      const matchesRegion = matchesRegionFilter(v, selectedRegion);
      const matchesGender = selectedGender === 'all' || v.gender === selectedGender;

      return matchesSearch && matchesRegion && matchesGender;
    });

    // Apply sorting
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'lang') {
      result = [...result].sort((a, b) => a.language.localeCompare(b.language));
    } else if (sortBy === 'country') {
      result = [...result].sort((a, b) => (a.country || '').localeCompare(b.country || ''));
    }

    return result;
  }, [allVoices, searchQuery, selectedRegion, selectedGender, sortBy]);

  const handleAudition = (voice: VoiceOption) => {
    const isThisVoicePlaying = audioTrackName.includes(voice.name) && isPlaying;
    if (isThisVoicePlaying) {
      togglePlayPause();
    } else {
      auditionVoice(voice);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedGender('all');
    setSortBy('default');
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedRegion !== 'all' ||
    selectedGender !== 'all' ||
    sortBy !== 'default';

  return (
    <div
      className="space-y-7 max-w-[1600px] mx-auto page-fade-in"
      role="region"
      aria-label="African Voice Gallery"
    >
      {/* ── Page Header Banner ── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-4">
        <div className="flex items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/10">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3.5 flex-wrap">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                African Voice Gallery
              </h1>
              <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-slate-800 text-slate-200 shadow-sm">
                {filteredVoices.length} of {allVoices.length} Personas
              </span>
            </div>
            <p className="text-base sm:text-lg text-slate-300 mt-2 font-normal leading-relaxed max-w-3xl">
              Audition native African speakers across East, West, Southern, Central, and Horn of Africa with authentic prosody.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/cloner')}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-base transition-all shadow-lg shadow-indigo-600/25 shrink-0 cursor-pointer h-14 focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Dna className="w-5 h-5" />
          <span>Clone Custom Voice</span>
        </button>
      </header>

      {/* ── Filter & Search Toolbar ── */}
      <VoiceGalleryFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
        sortBy={sortBy}
        onSortChange={setSortBy}
        allVoices={allVoices}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── Empty State ── */}
      {filteredVoices.length === 0 ? (
        <VoiceGalleryEmptyState
          onResetFilters={handleResetFilters}
          searchQuery={searchQuery}
        />
      ) : (
        /* ── Voice Cards Grid ── */
        <main
          aria-label="Speaker Personas Grid"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7"
        >
          {filteredVoices.map((voice) => {
            const isThisVoicePlaying = audioTrackName.includes(voice.name) && isPlaying;
            return (
              <VoiceCard
                key={voice.voice_id}
                voice={voice}
                isPlaying={isThisVoicePlaying}
                onAudition={() => handleAudition(voice)}
                onDeleteClone={removeClonedVoice}
              />
            );
          })}
        </main>
      )}
    </div>
  );
}
