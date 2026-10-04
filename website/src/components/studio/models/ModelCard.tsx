import React from 'react';
import { Download, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import type { ModelItem } from '../../../types/studio';

interface ModelCardProps {
  model: ModelItem;
  isPulling: boolean;
  onPull: (modelId: string) => void;
  onRemove: (modelId: string) => void;
}

export default function ModelCard({
  model,
  isPulling,
  onPull,
  onRemove,
}: ModelCardProps) {
  return (
    <article
      aria-label={`Model: ${model.name}`}
      className={`bg-[#101726] hover:bg-[#131d30] rounded-3xl p-7 shadow-xl flex flex-col justify-between space-y-6 transition-all group ${
        model.is_downloaded ? 'ring-1 ring-emerald-500/40' : ''
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-xl text-white group-hover:text-indigo-200 transition-colors">
              {model.name}
            </h3>
            <span className="text-sm font-mono text-slate-400 font-medium">{model.family}</span>
          </div>
          <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-white/[0.08] text-slate-200 shrink-0">
            {model.task}
          </span>
        </div>

        {/* Description */}
        <p className="text-base text-slate-200 leading-relaxed line-clamp-2">
          {model.description}
        </p>

        {/* Specs */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-sm text-slate-300 font-mono">
          <span>
            Size: <strong className="text-white font-bold">{model.size_mb} MB</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span>RAM: ~{model.ram_mb} MB</span>
          <span className="text-slate-600">•</span>
          <span className="text-indigo-300 font-semibold">
            {model.languages.slice(0, 4).join(', ')}
            {model.languages.length > 4 ? ` +${model.languages.length - 4}` : ''}
          </span>
        </div>

        {/* Local Path */}
        {model.local_path && (
          <div className="p-3 bg-[#070b14] rounded-xl text-xs font-mono text-slate-300 truncate">
            {model.local_path}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="pt-5 flex items-center justify-between border-t border-white/[0.06]">
        <div>
          {model.is_downloaded ? (
            <span className="inline-flex items-center gap-2 text-sm text-emerald-400 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Ready Offline</span>
            </span>
          ) : (
            <span className="text-sm text-slate-400 font-medium">Not Installed</span>
          )}
        </div>

        <div>
          {model.is_downloaded ? (
            <button
              type="button"
              onClick={() => onRemove(model.model_id)}
              className="h-12 px-5 rounded-2xl text-slate-300 hover:text-rose-400 hover:bg-rose-500/15 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Delete local weights and reclaim disk space"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reclaim Space</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isPulling}
              onClick={() => onPull(model.model_id)}
              className="h-12 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl text-sm flex items-center gap-2.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {isPulling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Pull Weights</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
