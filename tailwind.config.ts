import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--sur)',
        'surface-2': 'var(--sur2)',
        'surface-off': 'var(--soff)',
        'surface-dyn': 'var(--sdyn)',
        divider: 'var(--div)',
        border: 'var(--bor)',
        text: 'var(--tx)',
        'text-muted': 'var(--txm)',
        'text-field': 'var(--txf)',
        'text-inv': 'var(--txi)',
        accent: 'var(--a1)',
        'accent-hover': 'var(--a1h)',
        'accent-dim': 'var(--a1d)',
        'accent-2': 'var(--a2)',
        'accent-2-hover': 'var(--a2h)',
        'accent-2-dim': 'var(--a2d)',
        alert: 'var(--az)',
        nominal: 'var(--nom)',
        cold: 'var(--cold)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'xs-fluid': 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)',
        'sm-fluid': 'clamp(0.7rem, 0.68rem + 0.14vw, 0.82rem)',
        'base-fluid': 'clamp(0.75rem, 0.72rem + 0.16vw, 0.88rem)',
      },
      borderRadius: {
        widget: '0.625rem',
      },
      spacing: {
        widget: '0.75rem',
      },
    },
  },
  plugins: [],
};
export default config;
