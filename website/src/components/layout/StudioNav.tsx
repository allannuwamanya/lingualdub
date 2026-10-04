import React from 'react';
import { NavLink } from 'react-router-dom';
import { STUDIO_NAV } from './layoutConfig';

interface StudioNavProps {
  compact?: boolean;
}

export default function StudioNav({ compact = false }: StudioNavProps) {
  return (
    <nav aria-label="Studio rooms" className="flex flex-col gap-6">
      {STUDIO_NAV.map((group) => (
        <div key={group.label}>
          <p
            className={`px-3.5 mb-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-400 ${
              compact ? 'hidden lg:block' : ''
            }`}
          >
            {group.label}
          </p>
          <ul className="flex flex-col gap-1.5">
            {group.items.map(({ label, to, icon: Icon, end }) => {
              const IconComp = Icon!;
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    title={label}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3.5 h-12 px-4 rounded-xl text-base font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                        isActive
                          ? 'bg-indigo-600/25 text-white font-bold shadow-sm ring-1 ring-indigo-500/40'
                          : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                      } ${compact ? 'justify-center lg:justify-start' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <IconComp
                          className={`w-5 h-5 shrink-0 transition-colors ${
                            isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                          aria-hidden="true"
                        />
                        <span className={compact ? 'hidden lg:inline' : ''}>{label}</span>
                        {isActive && (
                          <span className="hidden lg:block ml-auto w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,1)]" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
