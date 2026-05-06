export const dynamic = 'force-dynamic';

'use client';

import { useState, useRef, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { FloorPlanGrid } from '@/components/floor-plan/FloorPlanGrid';
import { TaskSidebar } from '@/components/floor-plan/TaskSidebar';
import { DetailPanel } from '@/components/floor-plan/DetailPanel';

function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function WhereIsMyTaskPage() {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(async () => {
    try {
      const response = await fetch('/api/floor-plan/export');
      if (!response.ok) {
        throw new Error('Failed to export floor plan');
      }
      const data = await response.json();
      const timestamp = new Date().toISOString().split('T')[0];
      downloadJSON(data, `floor-plan-export-${timestamp}.json`);
    } catch (error) {
      alert(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }, []);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Reset the input so the same file can be selected again
      event.target.value = '';

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const response = await fetch('/api/floor-plan/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          setImportStatus({
            type: 'success',
            message: `Imported ${result.imported.rooms} rooms, ${result.imported.pins} pins, and ${result.imported.checklist_items} checklist items.`,
          });
          // Refresh the page to show new data
          window.location.reload();
        } else {
          setImportStatus({
            type: 'error',
            message: result.error || 'Import failed',
          });
        }
      } catch (error) {
        setImportStatus({
          type: 'error',
          message: error instanceof Error ? error.message : 'Invalid JSON file',
        });
      }

      // Clear status after 5 seconds
      setTimeout(() => setImportStatus(null), 5000);
    },
    [],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto' }}>
          {/* Export/Import header bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--bor)]">
            <h2 className="text-lg font-semibold">Floor Plan</h2>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Export
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Status notification */}
          {importStatus && (
            <div
              className={`mx-4 mt-2 p-3 rounded text-sm ${
                importStatus.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {importStatus.message}
            </div>
          )}

          <div className="flex h-[calc(100%-3rem)]">
            {/* Floor plan grid — main area */}
            <div className="flex-[3] p-4">
              <FloorPlanGrid />
            </div>

            {/* Task sidebar */}
            <div className="w-64 overflow-y-auto border-l border-[var(--bor)]">
              <TaskSidebar />
            </div>

            {/* Detail panel */}
            <div className="w-72 overflow-y-auto border-l border-[var(--bor)]">
              <DetailPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
