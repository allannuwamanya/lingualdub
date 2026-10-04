import React, { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedKey: string;
  onSaveKey: (key: string) => void;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  savedKey,
  onSaveKey,
}: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setKeyInput(savedKey);
    inputRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, savedKey, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(keyInput);
    setJustSaved(true);
    window.setTimeout(() => {
      setJustSaved(false);
      onClose();
    }, 900);
  };

  const handleRemove = () => {
    setKeyInput('');
    onSaveKey('');
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
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
              Enables cloud speech and translation for Luganda, Runyankore, Acholi, Ateso and more. The key
              is stored only in this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="sunbird-key" className="block text-sm font-medium text-slate-200 mb-1.5">
              Authorization token
            </label>
            <input
              id="sunbird-key"
              ref={inputRef}
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
                onClick={handleRemove}
                className="h-10 px-3 rounded-lg text-sm font-medium text-slate-300 hover:text-rose-300 hover:bg-slate-800 cursor-pointer"
              >
                Remove
              </button>
              <button
                type="submit"
                className="h-10 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 cursor-pointer"
              >
                Save key
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
