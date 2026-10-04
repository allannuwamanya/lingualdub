import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
  flag?: string;
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options = [],
  groups,
  placeholder = 'Select an option...',
  ariaLabel,
  disabled = false,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Consolidate flat options for lookup and keyboard navigation
  const allOptions: SelectOption[] = groups
    ? groups.flatMap((g) => g.options)
    : options;

  const selectedOption = allOptions.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const idx = allOptions.findIndex((opt) => opt.value === value);
        const step = e.key === 'ArrowDown' ? 1 : -1;
        const nextIdx = (idx + step + allOptions.length) % allOptions.length;
        onChange(allOptions[nextIdx].value);
      }
    }
  };

  const handleSelectOption = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const renderOptionItem = (opt: SelectOption) => {
    const isSelected = opt.value === value;
    return (
      <div
        key={opt.value}
        role="option"
        aria-selected={isSelected}
        onClick={() => handleSelectOption(opt.value)}
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors text-base select-none ${
          isSelected
            ? 'bg-indigo-600 text-white font-bold'
            : 'text-slate-200 hover:bg-white/[0.08] hover:text-white font-medium'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {opt.flag && <span className="text-xl leading-none shrink-0">{opt.flag}</span>}
          {opt.icon && <span className="shrink-0 text-indigo-400">{opt.icon}</span>}
          <div className="min-w-0">
            <span className="truncate block leading-tight">{opt.label}</span>
            {opt.description && (
              <span className={`text-xs block mt-0.5 truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                {opt.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {opt.badge && (
            <span className={`text-xs px-2 py-0.5 rounded-md font-mono ${isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-white/[0.06] text-slate-300'}`}>
              {opt.badge}
            </span>
          )}
          {isSelected && <Check className="w-5 h-5 shrink-0 text-white" />}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* ── Trigger Button ── */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        className={`w-full h-14 bg-[#070b14] hover:bg-[#0c1220] border border-white/[0.08] hover:border-indigo-500/40 rounded-2xl px-5 text-left flex items-center justify-between gap-3 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm ${
          isOpen ? 'ring-2 ring-indigo-500/60 border-transparent bg-[#0c1220]' : ''
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedOption?.flag && (
            <span className="text-xl leading-none shrink-0">{selectedOption.flag}</span>
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 text-indigo-400">{selectedOption.icon}</span>
          )}
          <span className="text-base sm:text-lg font-bold text-slate-100 truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* ── Popover Menu ── */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-2 p-2 bg-[#0e1526] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/90 backdrop-blur-2xl max-h-80 overflow-y-auto scrollbar-thin space-y-1 page-fade-in"
        >
          {groups ? (
            groups.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.04]">
                  {group.label}
                </div>
                {group.options.map(renderOptionItem)}
              </div>
            ))
          ) : (
            options.map(renderOptionItem)
          )}
        </div>
      )}
    </div>
  );
}
