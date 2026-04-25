import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_POLYGON_KEY: z.string().optional(),
  NEXT_PUBLIC_ALPHAVANTAGE_KEY: z.string().optional(),
  NEXT_PUBLIC_FINNHUB_KEY: z.string().optional(),
  NEXT_PUBLIC_OPENAQ_KEY: z.string().optional(),
  NEXT_PUBLIC_OPENUV_KEY: z.string().optional(),
  NEXT_PUBLIC_FRED_KEY: z.string().optional(),
  NEXT_PUBLIC_EIA_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(), // server-side only
});

function parseEnv() {
  return envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_POLYGON_KEY: process.env.NEXT_PUBLIC_POLYGON_KEY,
    NEXT_PUBLIC_ALPHAVANTAGE_KEY: process.env.NEXT_PUBLIC_ALPHAVANTAGE_KEY,
    NEXT_PUBLIC_FINNHUB_KEY: process.env.NEXT_PUBLIC_FINNHUB_KEY,
    NEXT_PUBLIC_OPENAQ_KEY: process.env.NEXT_PUBLIC_OPENAQ_KEY,
    NEXT_PUBLIC_OPENUV_KEY: process.env.NEXT_PUBLIC_OPENUV_KEY,
    NEXT_PUBLIC_FRED_KEY: process.env.NEXT_PUBLIC_FRED_KEY,
    NEXT_PUBLIC_EIA_KEY: process.env.NEXT_PUBLIC_EIA_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

let _env: z.infer<typeof envSchema> | undefined;

export function getEnv() {
  if (!_env) {
    _env = parseEnv();
  }
  return _env;
}
