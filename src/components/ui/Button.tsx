import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

const styles = {
  primary:
    'bg-accent text-white hover:opacity-90 focus-visible:ring-accent-border',
  ghost:
    'bg-transparent text-muted hover:bg-accent-bg hover:text-ink focus-visible:ring-accent-border',
};

export function Button({
  variant = 'ghost',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
