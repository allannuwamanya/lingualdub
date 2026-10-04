import React from 'react';
import { Search, X } from 'lucide-react';

interface ModelFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  tasksList: string[];
  selectedTask: string;
  onTaskChange: (task: string) => void;
  installedOnly: boolean;
  onInstalledOnlyChange: (installed: boolean) => void;
}

export default function ModelFilterToolbar({
  searchQuery,
  onSearchChange,
  tasksList,
  selectedTask,
  onTaskChange,
  installedOnly,
  onInstalledOnlyChange,
}: ModelFilterToolbarProps) {
  return (
    <div
      aria-label="Model Filters"
      className="p-6 bg-[#101726] rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5"
    >
      {/* Search Input */}
      <div className="relative flex-1 max-w-xl">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search weights by name, language (lug, swa), or architecture..."
          className="w-full bg-[#070b14] rounded-2xl pl-12 pr-11 py-3 text-base sm:text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-colors h-14"
          aria-label="Search models"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1.5 rounded-lg cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Task Tabs & Installed Filter */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-wrap">
        {tasksList.map((task) => {
          const active = selectedTask === task;
          return (
            <button
              key={task}
              type="button"
              onClick={() => onTaskChange(task)}
              className={`h-11 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-[#070b14] text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {task}
            </button>
          );
        })}

        <label className="flex items-center gap-2.5 ml-2 cursor-pointer select-none text-sm font-bold text-slate-300">
          <input
            type="checkbox"
            checked={installedOnly}
            onChange={(e) => onInstalledOnlyChange(e.target.checked)}
            className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
          />
          <span>Offline Ready Only</span>
        </label>
      </div>
    </div>
  );
}
