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
      className={`bg-[#101726] hover:bg-[#131d30] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all group ${
        model.is_downloaded ? 'ring-1 ring-emerald-500/30' : ''
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-white group-hover:text-indigo-200 transition-colors">
              {model.name}
            </h3>
            <span className="text-xs font-mono text-slate-400">{model.family}</span>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-white/[0.06] text-slate-200 shrink-0">
            {model.task}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
          {model.description}
        </p>

        {/* Specs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400 font-mono">
          <span>
            Size: <strong className="text-white">{model.size_mb} MB</strong>
          </span>
          <span>•</span>
          <span>RAM: ~{model.ram_mb} MB</span>
          <span>•</span>
          <span className="text-indigo-300">
            {model.languages.slice(0, 4).join(', ')}
            {model.languages.length > 4 ? ` +${model.languages.length - 4}` : ''}
          </span>
        </div>

        {/* Local Path */}
        {model.local_path && (
          <div className="p-2.5 bg-[#070b14] rounded-xl text-xs font-mono text-slate-400 truncate">
            {model.local_path}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="pt-4 flex items-center justify-between border-t border-white/[0.04]">
        <div>
          {model.is_downloaded ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready Offline</span>
            </span>
          ) : (
            <span className="text-xs text-slate-500">Not Installed</span>
          )}
        </div>

        <div>
          {model.is_downloaded ? (
            <button
              type="button"
              onClick={() => onRemove(model.model_id)}
              className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Delete local weights and reclaim disk space"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reclaim Space</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isPulling}
              onClick={() => onPull(model.model_id)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-indigo-500"
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
