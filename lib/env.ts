import { z } from 'zod';

const envSchema = z.object({
  // Public (client + server)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_OPENAQ_KEY: z.string().optional(),
  NEXT_PUBLIC_OPENUV_KEY: z.string().optional(),
  NEXT_PUBLIC_LATITUDE: z.string().optional(),
  NEXT_PUBLIC_LONGITUDE: z.string().optional(),
  NEXT_PUBLIC_TIMEZONE: z.string().optional(),
  NEXT_PUBLIC_CITY: z.string().optional(),
  NEXT_PUBLIC_COUNTRY: z.string().length(2).optional(),
  // Server-only (NIE eksponuj do klienta)
  POLYGON_KEY: z.string().optional(),
  FINNHUB_NEWS_KEY: z.string().optional(),
  ALPHA_VANTAGE_KEY: z.string().optional(),
  FRED_API_KEY: z.string().optional(),
  EIA_API_KEY: z.string().optional(),
  GOOGLE_CAL_API_KEY: z.string().optional(),
  GOOGLE_CAL_CALENDAR_ID: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

function parseEnv() {
  return envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_OPENAQ_KEY: process.env.NEXT_PUBLIC_OPENAQ_KEY,
    NEXT_PUBLIC_OPENUV_KEY: process.env.NEXT_PUBLIC_OPENUV_KEY,
    NEXT_PUBLIC_LATITUDE: process.env.NEXT_PUBLIC_LATITUDE,
    NEXT_PUBLIC_LONGITUDE: process.env.NEXT_PUBLIC_LONGITUDE,
    NEXT_PUBLIC_TIMEZONE: process.env.NEXT_PUBLIC_TIMEZONE,
    NEXT_PUBLIC_CITY: process.env.NEXT_PUBLIC_CITY,
    NEXT_PUBLIC_COUNTRY: process.env.NEXT_PUBLIC_COUNTRY,
    POLYGON_KEY: process.env.POLYGON_KEY,
    FINNHUB_NEWS_KEY: process.env.FINNHUB_NEWS_KEY,
    ALPHA_VANTAGE_KEY: process.env.ALPHA_VANTAGE_KEY,
    FRED_API_KEY: process.env.FRED_API_KEY,
    EIA_API_KEY: process.env.EIA_API_KEY,
    GOOGLE_CAL_API_KEY: process.env.GOOGLE_CAL_API_KEY,
    GOOGLE_CAL_CALENDAR_ID: process.env.GOOGLE_CAL_CALENDAR_ID,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  });
}

let _env: z.infer<typeof envSchema> | undefined;

export function getEnv() {
  if (!_env) {
    _env = parseEnv();
  }
  return _env;
}
