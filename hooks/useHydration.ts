'use client';

import { useState, useEffect } from 'react';

/**
 * SSR hydration guard hook.
 *
 * Returns `false` during server rendering and the first client render pass,
 * then `true` after hydration completes. Use this to gate any rendering
 * that depends on localStorage, Date.now(), window, or other browser-only
 * APIs to prevent hydration mismatches.
 *
 * @example
 * ```tsx
 * const hydrated = useHydration();
 * if (!hydrated) return <Skeleton />;
 * return <Clock time={Date.now()} />;
 * ```
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
