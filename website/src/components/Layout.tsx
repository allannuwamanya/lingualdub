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
  Menu,
  X,
  ArrowLeft,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import GithubIcon from './GithubIcon';
import TopLoadingBar from './TopLoadingBar';

export const DEFAULT_SUNBIRD_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6aXBwdWNvbm5lY3Rpb25zIiwiYWNjb3VudF90eXBlIjoiRnJlZSIsInR2IjoxLCJleHAiOjQ5NDQ2MTc0MTV9.aYIpIbngWvoIFFinJZVhw8ePpvdYIvNVJHTSf4ZmI04';

const WEBSITE_NAV_ITEMS = [
  { label: 'Home', to: '/', end: true },
  { label: 'Overview', to: '/overview', end: false },
  { label: 'Docs', to: '/docs', end: false },
  { label: 'Abstractions', to: '/abstractions', end: false },
  { label: 'Research', to: '/research', end: false },
  { label: 'Architecture', to: '/architecture', end: false },
];

const STUDIO_MODES = [
  { id: 'speech', label: 'Speech Lab', to: '/studio', icon: Mic, end: true },
  { id: 'dubbing', label: 'Dubbing Room', to: '/dubbing', icon: Film, end: false },
  { id: 'voices', label: 'Voices (22)', to: '/voices', icon: Users, end: false },
  { id: 'cloner', label: 'Voice Cloner', to: '/cloner', icon: Dna, end: false },
  { id: 'agent', label: 'Live Agent', to: '/agent', icon: MessageSquare, end: false },
  { id: 'models', label: 'Model Hub', to: '/models', icon: HardDrive, end: false },
  { id: 'specs', label: 'Specs & Docs', to: '/specs', icon: BookOpen, end: false },
];

export default function Layout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState<string>(() => {
    return typeof window !== 'undefined'
      ? localStorage.getItem('sunbird_api_key') || DEFAULT_SUNBIRD_KEY
      : DEFAULT_SUNBIRD_KEY;
  });
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [hardwareBadge, setHardwareBadge] = useState<{ accel: string; compute: string } | null>(null);

  const isStudioMode =
    pathname.startsWith('/studio') ||
    [
      '/speech',
      '/dubbing',
      '/voices',
      '/cloner',
      '/agent',
      '/models',
      '/mastering',
      '/settings',
    ].includes(pathname);

  // Initialize and sync API key from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('sunbird_api_key') || DEFAULT_SUNBIRD_KEY;
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

  // Scroll to top on route change (except when switching tabs within studio)
  useEffect(() => {
    if (!isStudioMode) {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, isStudioMode]);

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

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      <TopLoadingBar />

      {/* ── Studio Top Navigation Bar (When inside Voice Studio) ── */}
      {isStudioMode ? (
        <header className="sticky top-0 z-50 bg-[#070a12]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
          <div className="max-w-[1700px] mx-auto px-3 sm:px-5 lg:px-6 h-14 flex items-center justify-between gap-3">
            {/* Left: Studio Branding & Engine Telemetry */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/studio" className="flex items-center gap-2 group">
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

              {/* Back to Website Button */}
              <Link
                to="/"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/70 hover:bg-slate-700/80 hover:text-white border border-slate-700/60 transition-all"
                title="Return to LingualDub Website Home"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Website</span>
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
              {STUDIO_MODES.map((mode) => {
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
              <div className="flex items-center justify-between px-2 mb-2 pb-2 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Studio Workstation
                </span>
                <Link
                  to="/"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Website Home
                </Link>
              </div>
              {STUDIO_MODES.map((mode) => {
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
      ) : (
        /* ── Flagship Website Top Navigation Bar (When browsing Marketing / Docs) ── */
        <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="bg-white p-1 rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                <img
                  src="/logo.png"
                  alt="LingualDub Logo"
                  className="h-10 w-10 sm:h-11 sm:w-11 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-white leading-tight">
                  LingualDub
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-indigo-400 uppercase tracking-widest leading-none">
                  Speech AI Framework
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {WEBSITE_NAV_ITEMS.map(({ label, to, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white bg-slate-800/90 font-semibold shadow-inner border border-slate-700/60'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right: Launch Studio CTA + GitHub */}
            <div className="flex items-center gap-3">
              <Link
                to="/studio"
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Launch Voice Studio</span>
              </Link>

              <a
                href="https://github.com/allannuwamanya/lingualdub"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
              >
                <GithubIcon className="w-4 h-4 text-slate-300" />
                <span className="hidden lg:inline">GitHub</span>
              </a>

              {/* Mobile hamburger */}
              <button
                aria-label="Toggle menu"
                className="md:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="md:hidden bg-[#0c1220] border-t border-slate-800 px-4 py-3 flex flex-col gap-1.5 shadow-xl">
              {WEBSITE_NAV_ITEMS.map(({ label, to, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-slate-800 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <Link
                to="/studio"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Voice Studio</span>
              </Link>
            </div>
          )}
        </header>
      )}

      {/* ── Main Viewport ── */}
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>

      {/* ── Full Marketing Footer (Only on Marketing & Docs pages) ── */}
      {!isStudioMode && (
        <footer className="bg-[#050810] text-slate-400 py-12 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-white p-1 rounded-lg">
                  <img src="/logo.png" alt="LingualDub" className="h-8 w-8 object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg tracking-tight">LingualDub</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Low-Resource Speech AI
                  </span>
                </div>
              </Link>

              <p className="text-xs text-slate-400 text-center leading-relaxed max-w-md">
                An open, modular development framework for building, adapting, composing, and evaluating
                speech-AI systems for African languages.
              </p>

              <div className="flex items-center gap-4 flex-wrap justify-center">
                {WEBSITE_NAV_ITEMS.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  to="/studio"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Voice Studio
                </Link>
                <a
                  href="https://github.com/allannuwamanya/lingualdub"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors ml-1"
                  aria-label="GitHub Repository"
                >
                  <GithubIcon className="w-5 h-5" />
                </a>
              </div>
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
              Sunbird AI powers authentic native speech synthesis and translation for Ugandan languages:
              <strong className="text-emerald-400"> Luganda</strong>,{' '}
              <strong className="text-emerald-400"> Runyankole</strong>,{' '}
              <strong className="text-emerald-400"> Acholi</strong>, and{' '}
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
                  placeholder="Bearer token from api.sunbird.ai"
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
