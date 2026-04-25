import { describe, it, expect } from 'vitest';

const BASE = process.env.SMOKE_TEST_URL || 'https://scaling-eureka-ccfbb06d.vercel.app';

describe.skipIf(!process.env.RUN_SMOKE_TESTS)('Smoke tests', () => {
  it('GET /dashboard returns 200', async () => {
    const res = await fetch(`${BASE}/dashboard`);
    expect(res.status).toBe(200);
  });

  it('GET /calculators returns 200', async () => {
    const res = await fetch(`${BASE}/calculators`);
    expect(res.status).toBe(200);
  });
});
