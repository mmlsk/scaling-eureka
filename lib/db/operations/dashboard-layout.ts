import { db } from '@/lib/db';
import type { DashboardLayoutEntry } from '@/lib/db/schemas/dashboard-layout';

export async function saveLayout(key: string, value: unknown): Promise<void> {
  await db.dashboardLayout.put({
    key,
    value,
    updatedAt: new Date(),
  } as DashboardLayoutEntry);
}

export async function getLayout<T = unknown>(key: string): Promise<T | undefined> {
  const entry = await db.dashboardLayout.get(key);
  return entry?.value as T | undefined;
}

export async function getAllLayoutEntries(): Promise<DashboardLayoutEntry[]> {
  return await db.dashboardLayout.toArray();
}

export async function clearLayout(): Promise<void> {
  await db.dashboardLayout.clear();
}
