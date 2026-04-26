'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Hook do pobierania wydarzeń z Google Calendar przez proxy.
 * Wymaga public calendar lub OAuth flow (TBD Phase 9).
 * API key auth (key=...) działa tylko z publicznymi kalendarzami.
 */
export function useCalendarEvents(daysAhead = 7) {
  return useQuery({
    queryKey: ['calendar', daysAhead],
    queryFn: async () => {
      const calId = process.env.NEXT_PUBLIC_GOOGLE_CAL_CALENDAR_ID || 'primary';
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + daysAhead * 86400000).toISOString();
      const upstream = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
      const url = `/api/proxy/googlecal?url=${encodeURIComponent(upstream)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Calendar fetch failed');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
