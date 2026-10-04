import React from 'react';
import { Filter, Dna, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VoiceGalleryEmptyStateProps {
  onResetFilters: () => void;
  searchQuery?: string;
}

export default function VoiceGalleryEmptyState({
  onResetFilters,
  searchQuery,
}: VoiceGalleryEmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div
      role="status"
      className="p-12 text-center bg-[#101726] rounded-2xl shadow-xl space-y-5 max-w-xl mx-auto my-8"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-400">
        <Filter className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">No African Voices Found</h3>
        <p className="text-base text-slate-300">
          {searchQuery
            ? `No speaker personas match "${searchQuery}" under the active filters.`
            : 'No speaker personas match the selected region and gender filters.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onResetFilters}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 font-semibold text-sm rounded-xl transition-colors cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Filters</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/cloner')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Dna className="w-4 h-4" />
          <span>Clone This Voice</span>
        </button>
      </div>
    </div>
  );
}
