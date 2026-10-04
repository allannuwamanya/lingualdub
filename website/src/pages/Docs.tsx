import React from 'react';
import { Sparkles } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';
import DocsQuickstartCode from '../components/docs/DocsQuickstartCode';
import DocsTechnicalGuides from '../components/docs/DocsTechnicalGuides';

export default function Docs() {
  return (
    <div className="bg-[#070b14] text-white min-h-full page-fade-in">
      {/* Header */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 text-indigo-300 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Developer & API Reference • v0.1.0 Stable</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Documentation
          </h1>
          <p className="text-xl sm:text-2xl text-slate-200 leading-relaxed max-w-3xl font-normal">
            API reference, SDK integration guides, and component contracts for building, composing,
            and deploying speech AI pipelines with LingualDub.
          </p>
        </div>
      </section>

      {/* Release Announcement Banner */}
      <section className="py-10 bg-[#070b14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#101726] rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Release v0.1.0 Stable</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">LingualDub v0.1.0 is Live</h2>
              <p className="text-lg text-slate-200 max-w-2xl leading-relaxed">
                All foundational milestones (M0–M8) are complete: ASR, MT, TTS, code-switching, temporal alignment, voice retention, cross-lingual voice transfer, audio-visual sync, and Runyankole generalisation proof.
              </p>
            </div>
            <a
              href="https://github.com/allannuwamanya/lingualdub"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 transition-all shrink-0 cursor-pointer text-base"
            >
              <GithubIcon className="w-5 h-5 text-white" />
              <span>Follow on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Python SDK Quickstart */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Python SDK: End-to-End Pipeline</h2>
            <p className="text-lg text-slate-200 mt-2 max-w-2xl leading-relaxed">
              Execute a speech dubbing pipeline with declarative YAML configuration, assembly-time capability checking, and cryptographic consent tracking:
            </p>
          </div>
          <DocsQuickstartCode />
        </div>
      </section>

      {/* Core Technical Guides */}
      <section className="py-20 bg-[#070b14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Technical Guides & Architecture</h2>
            <p className="text-lg text-slate-200 mt-2">
              Complete technical documentation for building adapters, registering datasets, and evaluating pipelines:
            </p>
          </div>
          <DocsTechnicalGuides />
        </div>
      </section>
    </div>
  );
}
