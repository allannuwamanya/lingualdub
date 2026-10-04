import React, { useEffect, useRef, useState } from 'react';
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
  Menu,
  X,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  Settings,
  Cloud,
  Server,
  CheckCircle2,
} from 'lucide-react';
import GithubIcon from './GithubIcon';
import TopLoadingBar from './TopLoadingBar';
import {
  readSunbirdKey,
  SUNBIRD_KEY_EVENT,
  SUNBIRD_KEY_STORAGE,
} from '../lib/config';

/* ──────────────────────────────────────────────────────────────
   Navigation model
   ────────────────────────────────────────────────────────────── */

const WEBSITE_NAV_ITEMS = [
  { label: 'Home', to: '/', end: true },
  { label: 'Overview', to: '/overview', end: false },
  { label: 'Docs', to: '/docs', end: false },
  { label: 'Abstractions', to: '/abstractions', end: false },
  { label: 'Research', to: '/research', end: false },
  { label: 'Architecture', to: '/architecture', end: false },
];

const STUDIO_NAV = [
  {
    label: 'Create',
    items: [
      { label: 'Speech Lab', to: '/studio', icon: Mic, end: true },
      { label: 'Dubbing Room', to: '/dubbing', icon: Film, end: false },
      { label: 'Live Agent', to: '/agent', icon: MessageSquare, end: false },
    ],
  },
  {
    label: 'Library',
    items: [
      { label: 'Voices', to: '/voices', icon: Users, end: false },
      { label: 'Voice Cloner', to: '/cloner', icon: Dna, end: false },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Mastering', to: '/mastering', icon: SlidersHorizontal, end: false },
      { label: 'Model Hub', to: '/models', icon: HardDrive, end: false },
      { label: 'Settings', to: '/settings', icon: Settings, end: false },
    ],
  },
];

const STUDIO_PATHS = [
  '/studio',
  '/speech',
  '/dubbing',
  '/voices',
  '/cloner',
  '/agent',
  '/models',
  '/mastering',
  '/settings',
];

type ServerState = 'checking' | 'online' | 'offline';

/* ──────────────────────────────────────────────────────────────
   Studio sidebar navigation (shared by desktop rail + mobile drawer)
   ────────────────────────────────────────────────────────────── */

function StudioNav({ compact = false }: { compact?: boolean }) {
  return (
    <nav aria-label="Studio rooms" className="flex flex-col gap-6">
      {STUDIO_NAV.map((group) => (
        <div key={group.label}>
          <p
            className={`px-3 mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 ${
              compact ? 'hidden lg:block' : ''
            }`}
          >
            {group.label}
          </p>
          <ul className="flex flex-col gap-1.5">
            {group.items.map(({ label, to, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  title={label}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3.5 h-11 px-3.5 rounded-xl text-[15px] font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                      isActive
                        ? 'bg-indigo-600/20 text-white font-semibold shadow-sm ring-1 ring-indigo-500/30'
                        : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                    } ${compact ? 'justify-center lg:justify-start' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                        aria-hidden="true"
                      />
                      <span className={compact ? 'hidden lg:inline' : ''}>{label}</span>
                      {isActive && (
                        <span className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,1)]" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/* ──────────────────────────────────────────────────────────────
   Layout
   ────────────────────────────────────────────────────────────── */

export default function Layout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState<string>(() => readSunbirdKey());
  const [justSaved, setJustSaved] = useState(false);
  const [server, setServer] = useState<ServerState>('checking');
  const keyInputRef = useRef<HTMLInputElement>(null);
  const keyTriggerRef = useRef<HTMLButtonElement>(null);

  const isStudio = STUDIO_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Local server health
  useEffect(() => {
    let cancelled = false;
    fetch('/v1/system/probe')
      .then((res) => {
        const type = res.headers.get('content-type') || '';
        if (!res.ok || !type.includes('json')) throw new Error('offline');
        return res.json();
      })
      .then(() => !cancelled && setServer('online'))
      .catch(() => !cancelled && setServer('offline'));
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep key state in sync with other tabs/components
  useEffect(() => {
    const sync = () => setSavedKey(readSunbirdKey());
    window.addEventListener(SUNBIRD_KEY_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SUNBIRD_KEY_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Close menus + reset scroll on navigation
  useEffect(() => {
    setMenuOpen(false);
    if (!isStudio) window.scrollTo({ top: 0 });
  }, [pathname, isStudio]);

  // Key modal: Esc to close, focus management
  useEffect(() => {
    if (!keyModalOpen) return;
    setKeyInput(savedKey);
    keyInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setKeyModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyModalOpen]);

  const closeKeyModal = () => {
    setKeyModalOpen(false);
    keyTriggerRef.current?.focus();
  };

  const persistKey = (value: string) => {
    const trimmed = value.trim();
    if (trimmed) localStorage.setItem(SUNBIRD_KEY_STORAGE, trimmed);
    else localStorage.removeItem(SUNBIRD_KEY_STORAGE);
    setSavedKey(readSunbirdKey());
    window.dispatchEvent(new Event(SUNBIRD_KEY_EVENT));
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    persistKey(keyInput);
    setJustSaved(true);
    window.setTimeout(() => {
      setJustSaved(false);
      closeKeyModal();
    }, 900);
  };

  const cloudConnected = Boolean(savedKey);

  const activeRoom =
    pathname.startsWith('/dubbing') ? { label: 'Dubbing Room', icon: Film } :
    pathname.startsWith('/agent') ? { label: 'Live Agent', icon: MessageSquare } :
    pathname.startsWith('/voices') ? { label: 'Voice Gallery', icon: Users } :
    pathname.startsWith('/cloner') ? { label: 'Voice Cloner', icon: Dna } :
    pathname.startsWith('/mastering') ? { label: 'Mastering Rack', icon: SlidersHorizontal } :
    pathname.startsWith('/models') ? { label: 'Neural Model Hub', icon: HardDrive } :
    pathname.startsWith('/settings') ? { label: 'Engine Settings', icon: Settings } :
    { label: 'Speech Lab', icon: Mic };

  /* ── Pills shared by studio top bar ── */
  const statusPills = (
    <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-300">
      <span
        className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-white/[0.04] text-slate-300"
        title={cloudConnected ? 'Sunbird Regional Cloud Token active' : 'Click API Key to configure token'}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            cloudConnected ? 'bg-emerald-400' : 'bg-slate-600'
          }`}
          aria-hidden="true"
        />
        <Cloud className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        <span>{cloudConnected ? 'Sunbird Cloud' : 'Cloud Offline'}</span>
      </span>

      <span
        className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-white/[0.04] text-slate-300"
        title={
          server === 'online'
            ? 'Local LingualDub Python backend connected on :8000'
            : 'Local server offline. Cloud and browser speech engines remain available.'
        }
      >
        <span
          className={`w-2 h-2 rounded-full ${
            server === 'online' ? 'bg-emerald-400' : 'bg-slate-600'
          }`}
          aria-hidden="true"
        />
        <Server className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        <span>{server === 'checking' ? 'Probing…' : server === 'online' ? 'Local Edge :8000' : 'Edge Offline'}</span>
      </span>
    </div>
  );

  return (
    <div
      className={`bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white ${
        isStudio ? 'h-dvh overflow-hidden' : 'min-h-screen'
      }`}
    >
      <TopLoadingBar />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-white focus:text-slate-900"
      >
        Skip to content
      </a>

      {isStudio ? (
        /* ───────────── STUDIO APP SHELL ───────────── */
        <>
          <header className="h-16 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 border-b border-white/[0.06] bg-[#0c1220]/95 backdrop-blur-md z-30">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-xl text-slate-300 hover:bg-white/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link
                to="/studio"
                className="flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 group"
              >
                <div className="p-1 rounded-lg bg-indigo-500/10 group-hover:scale-105 transition-transform">
                  <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">LingualDub</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 uppercase tracking-wider">
                  Studio
                </span>
              </Link>

              {/* Breadcrumb separator & Active Room Badge */}
              <div className="hidden sm:flex items-center gap-2 pl-3 text-sm font-medium text-slate-400">
                <span className="text-slate-600">/</span>
                <span className="flex items-center gap-2 text-white font-semibold">
                  <activeRoom.icon className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                  {activeRoom.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {statusPills}

              <button
                ref={keyTriggerRef}
                type="button"
                onClick={() => setKeyModalOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.1] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors cursor-pointer"
              >
                <Key className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">API Key</span>
              </button>

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
                title="Return to marketing website"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span className="hidden md:inline">Website</span>
              </Link>

              <a
                href="https://github.com/allannuwamanya/lingualdub"
                target="_blank"
                rel="noreferrer"
                aria-label="LingualDub on GitHub"
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </header>

          <div className="flex flex-1 min-h-0 relative">
            {/* Desktop / tablet rail */}
            <aside className="hidden md:flex flex-col justify-between shrink-0 md:w-16 lg:w-64 border-r border-white/[0.05] bg-[#090e1a] p-3 overflow-y-auto">
              <StudioNav compact />
              <div className="mt-6 pt-4 border-t border-white/[0.05]">
                <Link
                  to="/specs"
                  title="Framework docs"
                  className="flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white md:justify-center lg:justify-start outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-slate-400" aria-hidden="true" />
                  <span className="hidden lg:inline">Framework docs</span>
                  <ExternalLink className="hidden lg:block w-3.5 h-3.5 ml-auto text-slate-500" aria-hidden="true" />
                </Link>
              </div>
            </aside>

            {/* Mobile drawer */}
            {menuOpen && (
              <div className="md:hidden absolute inset-0 z-40 flex">
                <div className="w-72 max-w-[85%] bg-[#090e1a] border-r border-white/[0.06] p-4 flex flex-col justify-between overflow-y-auto shadow-2xl">
                  <div>
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="" className="h-6 w-6 object-contain" />
                        <span className="font-bold text-white text-sm">LingualDub Studio</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                        aria-label="Close navigation"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <StudioNav />
                  </div>

                  <div className="pt-6 border-t border-white/[0.05] space-y-2">
                    <Link
                      to="/"
                      className="flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/[0.06]"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      <span>Back to website</span>
                    </Link>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex-1 bg-black/70 backdrop-blur-sm"
                  aria-label="Close navigation backdrop"
                  onClick={() => setMenuOpen(false)}
                />
              </div>
            )}

            <main id="main" className="flex-1 min-w-0 flex flex-col min-h-0">
              <Outlet />
            </main>
          </div>
        </>
      ) : (
        /* ───────────── MARKETING SITE ───────────── */
        <>
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
                  className="md:hidden h-11 w-11 inline-flex items-center justify-center rounded-xl text-slate-200 hover:bg-white/[0.06]"
                  onClick={() => setMenuOpen((v) => !v)}
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

          <main id="main" className="flex-1 flex flex-col min-h-0">
            <Outlet />
          </main>

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
        </>
      )}

      {/* ───────────── API KEY DIALOG ───────────── */}
      {keyModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeKeyModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="key-dialog-title"
            className="w-full max-w-md rounded-2xl bg-[#0f1526] ring-1 ring-slate-700 shadow-2xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="key-dialog-title" className="text-lg font-semibold text-white">
                  Sunbird API key
                </h2>
                <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                  Enables cloud speech and translation for Luganda, Runyankole, Acholi, Ateso and more. The key
                  is stored only in this browser.
                </p>
              </div>
              <button
                type="button"
                onClick={closeKeyModal}
                aria-label="Close"
                className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="mt-5 space-y-4">
              <div>
                <label htmlFor="sunbird-key" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Authorization token
                </label>
                <input
                  id="sunbird-key"
                  ref={keyInputRef}
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste your token from api.sunbird.ai"
                  className="w-full h-12 rounded-xl bg-[#070b14] px-4 text-base text-slate-100 font-mono placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all"
                />
              </div>

              {justSaved && (
                <p role="status" className="flex items-center gap-2 text-sm text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Saved. Cloud voices are now active.
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <a
                  href="https://api.sunbird.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-300"
                >
                  Get a key <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setKeyInput('');
                      persistKey('');
                    }}
                    className="h-10 px-3 rounded-lg text-sm font-medium text-slate-300 hover:text-rose-300 hover:bg-slate-800"
                  >
                    Remove
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  >
                    Save key
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
