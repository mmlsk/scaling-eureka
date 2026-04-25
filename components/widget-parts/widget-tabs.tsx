'use client';

interface WidgetTabsProps<T extends string> {
  tabs: { key: T; label: string }[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function WidgetTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: WidgetTabsProps<T>) {
  return (
    <div className="flex gap-1 flex-wrap" role="tablist" aria-label="Zakladki widgetu">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            className="btn-secondary"
            style={
              isActive
                ? {
                    borderColor: 'var(--a1)',
                    color: 'var(--a1)',
                    background: 'var(--a1d)',
                  }
                : {}
            }
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
