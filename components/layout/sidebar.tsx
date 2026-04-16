'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function DashboardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="8" y2="10" />
      <line x1="12" y1="10" x2="12" y2="10" />
      <line x1="16" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" />
      <line x1="12" y1="14" x2="12" y2="14" />
      <line x1="16" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="8" y2="18" />
      <line x1="12" y1="18" x2="16" y2="18" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/calculators', label: 'Calculators', icon: <CalculatorIcon /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '180px',
        borderRight: '1px solid var(--bor)',
        background: 'var(--sur)',
        padding: '0.75rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        flexShrink: 0,
      }}
    >
      <nav>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--a1)' : 'var(--txm)',
                background: isActive ? 'var(--a1d)' : 'transparent',
                borderLeft: isActive
                  ? '2px solid var(--a1)'
                  : '2px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
