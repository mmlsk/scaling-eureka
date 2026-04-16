'use client';

import { useEffect } from 'react';
import { useLifeOsStore } from '@/store/useLifeOsStore';
import { useHydration } from '@/hooks/useHydration';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const palette = useLifeOsStore((s) => s.palette);
  const theme = useLifeOsStore((s) => s.theme);
  const hydrated = useHydration();

  useEffect(() => {
    if (!hydrated) return;

    const root = document.documentElement;
    root.setAttribute('data-palette', palette);
    root.setAttribute('data-theme', theme);
  }, [palette, theme, hydrated]);

  return <>{children}</>;
}
