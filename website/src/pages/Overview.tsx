import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Overview() {
  return (
    <div className="bg-[#070b14] text-white min-h-full page-fade-in">
      {/* Page header */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Project Overview</p>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            What is LingualDub?
          </h1>
          <p className="text-xl sm:text-2xl text-slate-200 leading-relaxed max-w-3xl font-normal">
            An open, modular development framework for speech AI research in low-resource language contexts —
            designed to standardize and reuse infrastructure rather than rebuild it from scratch for every language.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">The Problem</h2>
          </div>
          <div className="bg-[#101726] rounded-3xl p-8 sm:p-10 space-y-6 shadow-xl">
            <p className="text-slate-200 text-lg leading-relaxed">
              Low-resource languages rarely share the same combination of speech data, text corpora,
              parallel translations, pronunciation resources, pretrained models, and evaluation sets.
              Developers and researchers repeatedly glue together incompatible ASR, translation, TTS,
              alignment, data, and evaluation components by hand.
            </p>
            <p className="text-slate-200 text-lg leading-relaxed">
              Critical research challenges — code-switching, language transfer, voice preservation,
              timing alignment, and evaluation — are typically scattered across separate projects
              rather than available in one composable environment.
            </p>
            <div className="border-l-4 border-rose-500/60 pl-6 py-3 bg-rose-500/5 rounded-r-2xl">
              <p className="text-rose-200 font-medium leading-relaxed text-base sm:text-lg">
                When a new language or research method is introduced, the surrounding infrastructure
                often has to be rebuilt rather than simply extended.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 bg-[#0b101c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">The Solution</h2>
          </div>
          <div className="bg-[#101726] rounded-3xl p-8 sm:p-10 shadow-xl space-y-8">
            <p className="text-slate-100 leading-relaxed text-xl sm:text-2xl">
              LingualDub makes the repeated engineering and research work around low-resource speech{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-100 font-bold">
                reusable, composable, and replaceable
              </span>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  title: 'Reusable',
                  desc: 'Components register once and are discovered by any compatible pipeline without copy-paste.',
                },
                {
                  title: 'Composable',
                  desc: 'Contracts define required and provided data types — verified at assembly time, not at runtime.',
                },
                {
                  title: 'Replaceable',
                  desc: 'Swap any model or component implementation without touching downstream stages or the framework core.',
                },
              ].map((p) => (
                <div key={p.title} className="bg-white/[0.04] hover:bg-white/[0.07] transition-colors rounded-2xl p-7">
                  <h3 className="font-bold text-white mb-2.5 text-xl">{p.title}</h3>
                  <p className="text-slate-300 text-base leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Extension Matrix */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Extension Matrix</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Components are the primary extension point. Add new capabilities without editing framework internals:
          </p>
          <div className="overflow-hidden rounded-3xl bg-[#101726] shadow-xl">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-white/[0.04] text-left">
                  <th className="px-6 py-4 font-bold text-white text-base">Goal</th>
                  <th className="px-6 py-4 font-bold text-white text-base">Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {[
                  ['New language', 'Register language metadata, resource profile, and available resources'],
                  ['New model', 'Implement and register a component conforming to interface'],
                  ['New method', 'Add a component or custom pipeline stage'],
                  ['New dataset', 'Register a resource with verified provenance and consent'],
                  ['New evaluator', 'Implement an evaluator component and register it'],
                  ['New pipeline', 'Compose existing components into a new pipeline flow'],
                ].map(([goal, how]) => (
                  <tr key={goal} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-indigo-400 whitespace-nowrap">{goal}</td>
                    <td className="px-6 py-4 text-slate-200">{how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Next CTA */}
      <section className="py-16 bg-[#0b101c]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-white text-xl">Next: Core Abstractions</p>
            <p className="text-base text-slate-300 mt-1">Language · Resource · Component · Pipeline · Result · Registry</p>
          </div>
          <Link
            to="/abstractions"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 shrink-0 text-base"
          >
            <span>Explore Abstractions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
