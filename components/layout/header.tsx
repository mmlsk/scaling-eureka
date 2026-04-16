'use client';

import { useState, useRef, useEffect } from 'react';
import { useLifeOsStore } from '@/store/useLifeOsStore';
import { useHydration } from '@/hooks/useHydration';
import type { Palette } from '@/types/state';

const PALETTES: { id: Palette; color: string; label: string }[] = [
  { id: 'reaktor', color: '#c4a24a', label: 'Reaktor' },
  { id: 'strefa', color: '#6a8a3a', label: 'Strefa' },
  { id: 'zimna', color: '#b0c0cc', label: 'Zimna' },
  { id: 'niebieski', color: '#4878b8', label: 'Niebieski' },
  { id: 'nocny', color: '#1ab0a8', label: 'Nocny' },
  { id: 'biala', color: '#a08050', label: 'Biala' },
];

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function Header() {
  const palette = useLifeOsStore((s) => s.palette);
  const theme = useLifeOsStore((s) => s.theme);
  const setPalette = useLifeOsStore((s) => s.setPalette);
  const setTheme = useLifeOsStore((s) => s.setTheme);
  const hydrated = useHydration();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    }

    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--bor)',
        background: 'var(--sur)',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(0.75rem, 0.7rem + 0.2vw, 0.95rem)',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--a1)',
          fontFamily: 'var(--font-mono), monospace',
          margin: 0,
        }}
      >
        LIFE OS
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Palette swatches */}
        {hydrated && (
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`pal-swatch${palette === p.id ? ' active' : ''}`}
                style={{ backgroundColor: p.color }}
                onClick={() => setPalette(p.id)}
                aria-label={`Palette: ${p.label}`}
                title={p.label}
              />
            ))}
          </div>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--txm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          {hydrated && (theme === 'dark' ? <SunIcon /> : <MoonIcon />)}
        </button>

        {/* Settings dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-label="Settings"
            title="Settings"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--txm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <GearIcon />
          </button>

          {settingsOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '0.375rem',
                background: 'var(--sur)',
                border: '1px solid var(--bor)',
                borderRadius: '8px',
                padding: '0.75rem',
                minWidth: '180px',
                zIndex: 50,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)',
                  color: 'var(--txm)',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Settings
              </div>
              <div
                style={{
                  fontSize: 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)',
                  color: 'var(--tx)',
                }}
              >
                <div style={{ padding: '0.375rem 0' }}>
                  Theme: {hydrated ? theme : '---'}
                </div>
                <div style={{ padding: '0.375rem 0' }}>
                  Palette: {hydrated ? palette : '---'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
