'use client';

interface FloorPlanShellProps {
  children: React.ReactNode;
}

export function FloorPlanShell({ children }: FloorPlanShellProps) {
  return (
    <div className="flex h-screen flex-col">
      {/* Header placeholder — will be added in page.tsx */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3-panel layout */}
        <div className="flex flex-1">
          {/* Main floor plan area — left side, takes most space */}
          <div className="flex-[3] overflow-auto p-4">
            {children}
          </div>

          {/* Task sidebar — middle panel */}
          <div className="w-64 overflow-y-auto border-l border-[var(--bor)]">
            {/* TaskSidebar will go here */}
          </div>

          {/* Detail panel — right panel */}
          <div className="w-72 overflow-y-auto border-l border-[var(--bor)]">
            {/* DetailPanel will go here */}
          </div>
        </div>
      </div>
    </div>
  );
}
