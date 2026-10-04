import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen } from 'lucide-react';
import GithubIcon from '../GithubIcon';

export default function HomeHero() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-7">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 text-indigo-300 text-sm font-semibold">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>Sovereign Voice AI for 51+ African Languages</span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
        Speech AI Infrastructure
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
          for Low-Resource Languages
        </span>
      </h1>

      <p className="text-lg sm:text-2xl text-slate-200 leading-relaxed max-w-3xl mx-auto font-normal">
        An open, modular development framework for building, adapting, composing, and evaluating 
        speech-AI systems — standardizing pipelines so models and tools can be wired together and extended.
      </p>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to="/studio"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer text-base"
        >
          <Sparkles className="w-5 h-5 text-indigo-200" />
          <span>Launch African Voice Studio</span>
        </Link>

        <Link
          to="/docs"
          className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] transition-all cursor-pointer text-base"
        >
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span>Developer Docs</span>
        </Link>

        <a
          href="https://github.com/allannuwamanya/lingualdub"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer text-base"
        >
          <GithubIcon className="w-4 h-4 text-slate-300" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );
}
