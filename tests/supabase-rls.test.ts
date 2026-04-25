import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe.skipIf(!url || !key)('Supabase RLS', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createClient(url!, key!);
  });

  it('anon cannot read habits', async () => {
    const { data } = await supabase.from('habits').select('*').limit(1);
    expect(data?.length ?? 0).toBe(0);
  });

  it('anon cannot read nootropics', async () => {
    const { data } = await supabase.from('nootropics').select('*').limit(1);
    expect(data?.length ?? 0).toBe(0);
  });

  it('anon cannot read sleep_log', async () => {
    const { data } = await supabase.from('sleep_log').select('*').limit(1);
    expect(data?.length ?? 0).toBe(0);
  });
});
