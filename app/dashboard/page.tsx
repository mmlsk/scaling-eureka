'use client';

import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import WidgetControls from '@/components/layout/widget-controls';
import { DashboardGrid } from './_components/dashboard-grid';

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <WidgetControls />
          <Suspense fallback={<div className="skeleton" style={{ height: '200px', width: '100%' }} />}>
          <DashboardGrid />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
