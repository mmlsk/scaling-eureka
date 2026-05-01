import { Dexie } from 'dexie';

export interface DashboardLayoutEntry {
  key: string;
  value: any;
  updatedAt: Date;
}

export const registerDashboardLayoutSchema = (db: Dexie, version: number) => {
  db.version(version).stores({
    dashboardLayout: 'key, updatedAt'
  });
};
