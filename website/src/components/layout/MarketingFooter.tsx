import React from 'react';
import { Link } from 'react-router-dom';
import { WEBSITE_NAV_ITEMS } from './layoutConfig';

export default function MarketingFooter() {
  return (
    <footer className="bg-[#050811] text-slate-400 py-14 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10">
            <img src="/logo.png" alt="LingualDub" className="h-8 w-8 object-contain rounded-md" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl tracking-tight">LingualDub</span>
            <span className="text-xs text-slate-400 font-medium">Low-resource speech AI</span>
          </div>
        </Link>
        <p className="text-base text-slate-300 text-center leading-relaxed max-w-md">
          An open, modular framework for building, composing and evaluating speech-AI systems for African
          languages.
        </p>
        <ul className="flex items-center gap-x-6 gap-y-2 flex-wrap justify-center text-base">
          {WEBSITE_NAV_ITEMS.map(({ label, to }) => (
            <li key={to}>
              <Link to={to} className="text-slate-300 hover:text-white transition-colors font-medium">
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/studio" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Studio
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
