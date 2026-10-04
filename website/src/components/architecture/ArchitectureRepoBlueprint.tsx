import React from 'react';

const REPO_STRUCTURE = [
  {
    path: 'lingualdub/',
    desc: 'Core framework package',
    sub: ['core/', 'registry/', 'components/', 'pipeline/', 'languages/', 'utils/'],
  },
  {
    path: 'research/',
    desc: 'Research module workspaces',
    sub: ['temporal_alignment/', 'code_switching/', 'voice_transfer/', 'voice_retention_eval/', 'av_sync/'],
  },
  { path: 'configs/', desc: 'Pipeline configuration templates', sub: [] },
  { path: 'notebooks/', desc: 'Jupyter notebooks for testing and pipelines', sub: [] },
  { path: 'website/', desc: 'LingualDub Web Portal (React + Tailwind + Vite)', sub: [] },
  { path: 'tests/', desc: 'Comprehensive test suite (740+ unit/integration tests)', sub: [] },
  { path: 'docs/', desc: 'Architecture guides and per-module documentation', sub: [] },
];

export default function ArchitectureRepoBlueprint() {
  return (
    <section className="py-20 bg-[#0b101c]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Repository Layout</h2>
          <p className="text-slate-400 text-base mt-2">
            Modular structure segregating core framework code, research workspaces, and web interface.
          </p>
        </div>

        <div className="bg-[#050811] rounded-3xl p-7 sm:p-9 font-mono text-sm shadow-2xl">
          <p className="text-indigo-400 font-bold mb-5 text-base">lingualdub/</p>
          {REPO_STRUCTURE.map(({ path, desc, sub }) => (
            <div key={path} className="mb-4 last:mb-0">
              <div className="flex items-baseline gap-3">
                <span className="text-white font-semibold text-sm">├── {path}</span>
                <span className="text-slate-400 text-xs hidden sm:inline"># {desc}</span>
              </div>
              {sub.length > 0 && (
                <div className="ml-6 mt-1 flex flex-wrap gap-x-5 gap-y-1">
                  {sub.map((s) => (
                    <span key={s} className="text-slate-400 text-xs">
                      │&nbsp;&nbsp;├── {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
