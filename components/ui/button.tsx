'use client';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const SIZE_STYLES: Record<
  NonNullable<ButtonProps['size']>,
  React.CSSProperties
> = {
  sm: {
    padding: '3px 8px',
    fontSize: 'clamp(0.55rem, 0.52rem + 0.1vw, 0.65rem)',
  },
  md: {
    padding: '6px 14px',
    fontSize: 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)',
  },
  lg: {
    padding: '8px 20px',
    fontSize: 'clamp(0.65rem, 0.62rem + 0.14vw, 0.78rem)',
  },
};

const VARIANT_STYLES: Record<
  NonNullable<ButtonProps['variant']>,
  React.CSSProperties
> = {
  primary: {
    background: 'var(--a1)',
    color: 'var(--txi)',
    border: 'none',
  },
  secondary: {
    background: 'var(--soff)',
    color: 'var(--tx)',
    border: '1px solid var(--bor)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--txm)',
    border: '1px solid transparent',
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    borderRadius: '6px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s, border-color 0.15s',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
    lineHeight: 1.4,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    ...SIZE_STYLES[size],
    ...VARIANT_STYLES[variant],
  };

  return (
    <button
      type={type}
      style={baseStyle}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}
