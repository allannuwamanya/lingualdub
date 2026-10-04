import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { REGION_TABS } from './galleryData';
import type { RegionFilterId } from './galleryData';
import type { VoiceOption } from '../../../types/studio';
import CustomSelect, { type SelectOption } from '../CustomSelect';

const SORT_OPTIONS: SelectOption[] = [
  { value: 'default', label: 'Featured / Default' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'lang', label: 'Language (A-Z)' },
  { value: 'country', label: 'Country' },
];

interface VoiceGalleryFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRegion: RegionFilterId;
  onRegionChange: (r: RegionFilterId) => void;
  selectedGender: 'all' | 'Female' | 'Male';
  onGenderChange: (g: 'all' | 'Female' | 'Male') => void;
  sortBy: 'default' | 'name' | 'lang' | 'country';
  onSortChange: (s: 'default' | 'name' | 'lang' | 'country') => void;
  allVoices: VoiceOption[];
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export default function VoiceGalleryFilterBar({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedGender,
  onGenderChange,
  sortBy,
  onSortChange,
  allVoices,
  onResetFilters,
  hasActiveFilters,
}: VoiceGalleryFilterBarProps) {
  // Compute counts per region
  const getRegionCount = (tabId: RegionFilterId): number => {
    if (tabId === 'all') return allVoices.length;
    if (tabId === 'cloned') {
      return allVoices.filter((v) => v.isCloned || v.voice_id.startsWith('clone_')).length;
    }
    const tab = REGION_TABS.find((t) => t.id === tabId);
    if (!tab || !tab.languages) return 0;
    return allVoices.filter((v) => tab.languages?.includes(v.language)).length;
  };

  return (
    <section
      aria-label="Voice Filters and Search"
      className="bg-[#101726] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5"
    >
      {/* ── Top Row: Search, Gender, and Sort ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, language, country, or dialect..."
            className="w-full bg-[#070b14] rounded-2xl pl-12 pr-11 py-3 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-14"
            aria-label="Search personas"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Clear search input"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Gender Filter Segmented Control */}
        <div className="flex items-center gap-1.5 bg-[#070b14] p-1.5 rounded-2xl shrink-0">
          {(['all', 'Female', 'Male'] as const).map((gender) => {
            const active = selectedGender === gender;
            return (
              <button
                key={gender}
                type="button"
                onClick={() => onGenderChange(gender)}
                className={`h-11 px-5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
                aria-pressed={active}
              >
                {gender === 'all' ? 'All Genders' : gender === 'Female' ? 'Female ♀' : 'Male ♂'}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-[210px]">
          <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
            Sort:
          </span>
          <div className="flex-1">
            <CustomSelect
              id="voice-sort"
              value={sortBy}
              onChange={(val) => onSortChange(val as any)}
              options={SORT_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Regional Filter Pills ── */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
        <div
          role="tablist"
          aria-label="Filter by geographic region"
          className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none py-1 flex-1"
        >
          {REGION_TABS.map((tab) => {
            const active = selectedRegion === tab.id;
            const count = getRegionCount(tab.id);
            if (tab.id === 'cloned' && count === 0) return null;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => onRegionChange(tab.id)}
                className={`h-12 px-4.5 py-2.5 rounded-2xl text-sm sm:text-base font-bold whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-[#070b14] text-slate-200 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span className="text-lg leading-none">{tab.flag}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                    active ? 'bg-indigo-900 text-indigo-100' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-2 h-12 px-4 rounded-2xl text-sm font-bold text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 shrink-0 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Reset all search queries and filters"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </section>
  );
}
