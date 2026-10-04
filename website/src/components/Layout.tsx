import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, ExternalLink, ArrowLeft, X } from 'lucide-react';
import TopLoadingBar from './TopLoadingBar';
import { readSunbirdKey, SUNBIRD_KEY_EVENT, SUNBIRD_KEY_STORAGE } from '../lib/config';
import { STUDIO_PATHS, type ServerState } from './layout/layoutConfig';
import StudioNav from './layout/StudioNav';
import StudioHeader from './layout/StudioHeader';
import MarketingHeader from './layout/MarketingHeader';
import MarketingFooter from './layout/MarketingFooter';
import ApiKeyModal from './layout/ApiKeyModal';

export default function Layout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [savedKey, setSavedKey] = useState<string>(() => readSunbirdKey());
  const [server, setServer] = useState<ServerState>('checking');
  const keyTriggerRef = useRef<HTMLButtonElement>(null);

  const isStudio = STUDIO_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

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

  useEffect(() => {
    const sync = () => setSavedKey(readSunbirdKey());
    window.addEventListener(SUNBIRD_KEY_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SUNBIRD_KEY_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    if (!isStudio) window.scrollTo({ top: 0 });
  }, [pathname, isStudio]);

  const persistKey = (value: string) => {
    const trimmed = value.trim();
    if (trimmed) localStorage.setItem(SUNBIRD_KEY_STORAGE, trimmed);
    else localStorage.removeItem(SUNBIRD_KEY_STORAGE);
    setSavedKey(readSunbirdKey());
    window.dispatchEvent(new Event(SUNBIRD_KEY_EVENT));
  };

  const cloudConnected = Boolean(savedKey);

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
        <>
          <StudioHeader
            pathname={pathname}
            menuOpen={menuOpen}
            onToggleMenu={() => setMenuOpen((v) => !v)}
            cloudConnected={cloudConnected}
            server={server}
            onOpenKeyModal={() => setKeyModalOpen(true)}
            keyTriggerRef={keyTriggerRef}
          />

          <div className="flex flex-1 min-h-0 relative">
            <aside className="hidden md:flex flex-col justify-between shrink-0 md:w-20 lg:w-72 border-r border-white/[0.05] bg-[#090e1a] p-4 overflow-y-auto">
              <StudioNav compact />
              <div className="mt-6 pt-4 border-t border-white/[0.05]">
                <Link
                  to="/specs"
                  title="Framework docs"
                  className="flex items-center gap-3 h-12 px-4 rounded-xl text-sm sm:text-base font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white md:justify-center lg:justify-start outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-slate-400" aria-hidden="true" />
                  <span className="hidden lg:inline">Framework docs</span>
                  <ExternalLink className="hidden lg:block w-4 h-4 ml-auto text-slate-500" aria-hidden="true" />
                </Link>
              </div>
            </aside>

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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
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
                  className="flex-1 bg-black/70 backdrop-blur-sm cursor-pointer"
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
        <>
          <MarketingHeader menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />
          <main id="main" className="flex-1 flex flex-col min-h-0">
            <Outlet />
          </main>
          <MarketingFooter />
        </>
      )}

      <ApiKeyModal
        isOpen={keyModalOpen}
        onClose={() => {
          setKeyModalOpen(false);
          keyTriggerRef.current?.focus();
        }}
        savedKey={savedKey}
        onSaveKey={persistKey}
      />
    </div>
  );
}
