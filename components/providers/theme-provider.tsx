'use client';

import { useEffect, useState } from 'react';
import { useLifeOsStore } from '@/store/useLifeOsStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Inline script injected into <head> to read persisted Zustand theme
 * before React hydrates — prevents FOUC and hydration mismatches.
 *
 * Reads the 'life-os-store' localStorage key (Zustand persist) and
 * applies data-theme and data-palette to <html> immediately.
 */
export const ThemeScript = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `(function(){try{var s=JSON.parse(localStorage.getItem('life-os-store'));if(s&&s.state){var r=document.documentElement;if(s.state.theme)r.setAttribute('data-theme',s.state.theme);if(s.state.palette)r.setAttribute('data-palette',s.state.palette)}}catch(e){}})()`,
    }}
  />
);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const palette = useLifeOsStore((s) => s.palette);
  const theme = useLifeOsStore((s) => s.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: one-time SSR hydration guard
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.setAttribute('data-palette', palette);
    root.setAttribute('data-theme', theme);
  }, [palette, theme, mounted]);

  return <>{children}</>;
}
