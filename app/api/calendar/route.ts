import { NextResponse } from 'next/server';
import type { GoogleCalEvent } from '@/types/api';

// ── Google Calendar API Response Shape ──
interface GoogleCalendarListResponse {
  items: GoogleCalendarItem[];
  nextPageToken?: string;
}

interface GoogleCalendarItem {
  id: string;
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  status?: string;
}

// ── Token Refresh Response ──
interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Google token refresh failed: ${res.status} ${errorBody}`);
  }

  const data: GoogleTokenResponse = await res.json();
  return data.access_token;
}

interface CalendarAPIResponse {
  events: GoogleCalEvent[];
  error: string | null;
}

export async function GET(): Promise<NextResponse<CalendarAPIResponse>> {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!refreshToken) {
    return NextResponse.json(
      { events: [], error: 'GOOGLE_REFRESH_TOKEN not configured' },
      { status: 200 },
    );
  }

  try {
    const accessToken = await refreshAccessToken(refreshToken);

    const now = new Date();
    const timeMin = now.toISOString();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const timeMax = futureDate.toISOString();

    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50',
    });

    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary';
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Google Calendar API failed: ${res.status} ${errorBody}`);
    }

    const data: GoogleCalendarListResponse = await res.json();

    const events: GoogleCalEvent[] = data.items
      .filter((item) => item.status !== 'cancelled')
      .map((item) => ({
        id: item.id,
        title: item.summary ?? 'Untitled',
        date: item.start?.dateTime ?? item.start?.date ?? '',
        end: item.end?.dateTime ?? item.end?.date ?? '',
        source: 'google' as const,
      }));

    return NextResponse.json({ events, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { events: [], error: message },
      { status: 200 },
    );
  }
}
