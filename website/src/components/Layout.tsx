import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Mic,
  Film,
  Users,
  Dna,
  MessageSquare,
  HardDrive,
  BookOpen,
  Key,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Volume2,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import GithubIcon from './GithubIcon';
import TopLoadingBar from './TopLoadingBar';

const WORKSTATION_MODES = [
  { id: 'speech', label: 'Speech Lab', to: '/', icon: Mic, end: true },
  { id: 'dubbing', label: 'Dubbing Room', to: '/dubbing', icon: Film, end: false },
  { id: 'voices', label: 'Voices (22)', to: '/voices', icon: Users, end: false },
  { id: 'cloner', label: 'Voice Cloner', to: '/cloner', icon: Dna, end: false },
  { id: 'agent', label: 'Live Agent', to: '/agent', icon: MessageSquare, end: false },
  { id: 'models', label: 'Model Hub', to: '/models', icon: HardDrive, end: false },
  { id: 'specs', label: 'Framework & Specs', to: '/specs', icon: BookOpen, end: false },
  { id: 'home', label: 'Landing & Mission', to: '/home', icon: Compass, end: false },
];

export default function Layout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [hardwareBadge, setHardwareBadge] = useState<{ accel: string; compute: string } | null>(null);

  // Initialize and sync API key from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('sunbird_api_key') || '';
      setSavedKey(existing);
      setApiKeyInput(existing);
    }
  }, [apiKeyModalOpen]);

  // Check hardware accelerator status
  useEffect(() => {
    fetch('/v1/system/probe')
      .then((res) => {
        const cType = res.headers.get('content-type') || '';
        return res.ok && cType.includes('json') ? res.json() : Promise.reject();
      })
      .then((data) => {
        if (data && data.accelerator) {
          setHardwareBadge({
            accel: data.accelerator.toUpperCase(),
            compute: data.compute_class || 'cpu',
          });
        }
      })
      .catch(() => {
        setHardwareBadge({ accel: 'CPU', compute: 'Host' });
      });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKeyInput.trim();
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('sunbird_api_key', trimmed);
        setSavedKey(trimmed);
      } else {
        localStorage.removeItem('sunbird_api_key');
        setSavedKey('');
      }
      window.dispatchEvent(new Event('sunbird_key_updated'));
    }
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setApiKeyModalOpen(false);
    }, 1200);
  };

  const isSpecsPage = ['/specs', '/architecture', '/abstractions', '/research', '/docs', '/overview'].some(
    (p) => pathname.startsWith(p)
  );

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      <TopLoadingBar />

      {/* ── DAW Pro Studio Top Navigation Bar (Fixed 56px) ── */}
      <header className="sticky top-0 z-50 bg-[#070a12]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-[1700px] mx-auto px-3 sm:px-5 lg:px-6 h-14 flex items-center justify-between gap-3">
          
          {/* Left: Studio Branding & Engine Telemetry */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 group-hover:border-indigo-400/60 transition-all p-1 shadow-inner">
                <img
                  src="/logo.png"
                  alt="LingualDub"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#070a12] animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white leading-none">
                  LingualDub
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  STUDIO
                </span>
              </div>
            </Link>

            {/* Hardware & Backend Status Pill (Desktop) */}
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-800/90 text-[11px]">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{savedKey ? 'Sunbird Cloud Active' : 'Neural Core Ready'}</span>
              </div>
              {hardwareBadge && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px]">
                  <Cpu className="w-3 h-3 text-slate-400" />
                  <span>{hardwareBadge.accel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Center: Workstation Mode Selector (Segmented DAW Controller) */}
          <nav className="hidden lg:flex items-center bg-[#0d1322] p-1 rounded-xl border border-slate-800/90 shadow-inner gap-0.5">
            {WORKSTATION_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <NavLink
                  key={mode.id}
                  to={mode.to}
                  end={mode.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Studio Quick Actions & Credentials */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sunbird API Key Quick Trigger */}
            <button
              onClick={() => setApiKeyModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                savedKey
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-300 hover:bg-amber-900/40'
              }`}
              title="Configure Sunbird AI credentials for native Ugandan speech"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {savedKey ? 'Sunbird Key: Connected' : 'Set Sunbird Key'}
              </span>
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/allannuwamanya/lingualdub"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-all hover:text-white"
              title="View LingualDub on GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">GitHub</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Workstation Navigation Drawer */}
        {menuOpen && (
          <div className="lg:hidden bg-[#0a0f1d] border-b border-slate-800 px-4 py-3 flex flex-col gap-1 shadow-2xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">
              Workstation Modes
            </p>
            {WORKSTATION_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <NavLink
                  key={mode.id}
                  to={mode.to}
                  end={mode.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{mode.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* ── Main Studio Workstation Viewport ── */}
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>

      {/* ── Minimalist Studio System Bar (Only on Framework Docs) ── */}
      {isSpecsPage && (
        <footer className="bg-[#050810] text-slate-400 py-6 border-t border-slate-800/80 text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-bold text-slate-200">LingualDub Framework</span>
              <span>•</span>
              <span>African Speech-AI Infrastructure</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <Link to="/" className="hover:text-white transition-colors">
                Return to Voice Studio
              </Link>
              <a
                href="https://github.com/allannuwamanya/lingualdub"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub Repo
              </a>
            </div>
          </div>
        </footer>
      )}

      {/* ── Sunbird AI API Credentials Modal ── */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0e1526] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sunbird AI Credentials</h3>
                  <p className="text-xs text-slate-400">Kampala, Uganda Speech Neural API</p>
                </div>
              </div>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Sunbird AI powers authentic native speech synthesis and transcription for Ugandan languages:
              <strong className="text-emerald-400"> Luganda</strong>, 
              <strong className="text-emerald-400"> Runyankole</strong>, 
              <strong className="text-emerald-400"> Acholi</strong>, and 
              <strong className="text-emerald-400"> Ateso</strong>.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sunbird API Authorization Token
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Bearer token or API key from api.sunbird.ai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {keySavedToast && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sunbird API key saved successfully in browser!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://sunbird.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setApiKeyInput('');
                      localStorage.removeItem('sunbird_api_key');
                      setSavedKey('');
                      window.dispatchEvent(new Event('sunbird_key_updated'));
                    }}
                    className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Clear Key
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
                  >
                    Save & Connect
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
