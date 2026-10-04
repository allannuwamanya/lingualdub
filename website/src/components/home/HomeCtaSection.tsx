import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen } from 'lucide-react';

export default function HomeCtaSection() {
  return (
    <section className="py-24 bg-[#070b14] text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Ready to Build Sovereign African Speech AI?
        </h2>
        <p className="text-slate-200 text-lg sm:text-xl leading-relaxed">
          Jump directly into the interactive studio or explore developer documentation to wire your own models.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/studio"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer text-base"
          >
            <Sparkles className="w-5 h-5 text-indigo-200" />
            <span>Launch Voice Studio</span>
          </Link>
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] transition-all cursor-pointer text-base"
          >
            <BookOpen className="w-4 h-4" />
            <span>Read Documentation</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
