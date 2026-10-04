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
      className="p-5 bg-[#101726] rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search weights by name, language (lug, swa), or architecture..."
          className="w-full bg-[#070b14] rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-colors h-11"
          aria-label="Search models"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Task Tabs & Installed Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {tasksList.map((task) => {
          const active = selectedTask === task;
          return (
            <button
              key={task}
              type="button"
              onClick={() => onTaskChange(task)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[38px] focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {task}
            </button>
          );
        })}

        <label className="flex items-center gap-2 ml-2 text-xs text-slate-300 cursor-pointer whitespace-nowrap px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl min-h-[38px] transition-colors select-none focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            type="checkbox"
            checked={installedOnly}
            onChange={(e) => onInstalledOnlyChange(e.target.checked)}
            className="accent-indigo-500 w-3.5 h-3.5 cursor-pointer"
          />
          <span>Installed Only</span>
        </label>
      </div>
    </div>
  );
}
