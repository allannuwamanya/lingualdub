import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { REGION_TABS } from './galleryData';
import type { RegionFilterId } from './galleryData';
import type { VoiceOption } from '../../../types/studio';

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
      className="bg-[#101726] rounded-2xl p-5 shadow-xl space-y-4"
    >
      {/* ── Top Row: Search, Gender, and Sort ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, language, country, or dialect..."
            className="w-full bg-[#070b14] rounded-xl pl-11 pr-10 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-12"
            aria-label="Search personas"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Gender Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-[#070b14] p-1.5 rounded-xl shrink-0">
          {(['all', 'Female', 'Male'] as const).map((gender) => {
            const active = selectedGender === gender;
            return (
              <button
                key={gender}
                type="button"
                onClick={() => onGenderChange(gender)}
                className={`min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
                aria-pressed={active}
              >
                {gender === 'all' ? 'All Genders' : gender === 'Female' ? 'Female ♀' : 'Male ♂'}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="voice-sort" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Sort:
          </label>
          <select
            id="voice-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="bg-[#070b14] text-slate-200 text-sm font-medium rounded-xl px-4 py-2.5 h-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            <option value="default">Featured / Default</option>
            <option value="name">Name (A-Z)</option>
            <option value="lang">Language (A-Z)</option>
            <option value="country">Country</option>
          </select>
        </div>
      </div>

      {/* ── Bottom Row: Regional Filter Pills ── */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.04]">
        <div
          role="tablist"
          aria-label="Filter by geographic region"
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1 flex-1"
        >
          {REGION_TABS.map((tab) => {
            const active = selectedRegion === tab.id;
            const count = getRegionCount(tab.id);
            if (tab.id === 'cloned' && count === 0) return null; // Hide cloned tab if none created yet

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => onRegionChange(tab.id)}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-[#070b14] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span>{tab.flag}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                    active ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 shrink-0 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[40px]"
            title="Reset all search queries and filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </section>
  );
}
