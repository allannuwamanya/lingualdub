import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';
import GithubIcon from '../GithubIcon';
import { WEBSITE_NAV_ITEMS } from './layoutConfig';

interface MarketingHeaderProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
}

export default function MarketingHeader({ menuOpen, onToggleMenu }: MarketingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="p-1.5 rounded-xl bg-indigo-500/10 group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="LingualDub" className="h-8 w-8 object-contain rounded-lg" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-white leading-tight">LingualDub</span>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider leading-none">
              Speech AI Framework
            </span>
          </div>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-1.5">
          {WEBSITE_NAV_ITEMS.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-xl text-[15px] font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isActive
                    ? 'bg-indigo-600/20 text-white font-semibold shadow-sm ring-1 ring-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,1)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl font-bold text-base text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" aria-hidden="true" />
            <span>Launch Studio</span>
          </Link>
          <a
            href="https://github.com/allannuwamanya/lingualdub"
            target="_blank"
            rel="noreferrer"
            aria-label="LingualDub on GitHub"
            className="hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden h-11 w-11 inline-flex items-center justify-center rounded-xl text-slate-200 hover:bg-white/[0.06] cursor-pointer"
            onClick={onToggleMenu}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#0b101c] border-t border-white/[0.06] px-4 py-3 flex flex-col gap-1.5">
          {WEBSITE_NAV_ITEMS.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-white font-semibold ring-1 ring-indigo-500/30'
                    : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,1)]" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
