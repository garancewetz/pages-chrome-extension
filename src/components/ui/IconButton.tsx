import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Tooltip } from './Tooltip';

type Variant = 'square' | 'bare';
type Size = 'xs' | 'sm' | 'md' | 'lg';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: ReactNode;
  label: string;
  variant?: Variant;
  size?: Size;
  tooltip?: string;
  tooltipSide?: 'top' | 'bottom';
};

const sizeClasses: Record<Size, string> = {
  xs: 'h-6 w-6',
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
};

const variantClasses: Record<Variant, string> = {
  square:
    'rounded-lg border-2 border-ink-200 bg-white text-ink-500 hover:border-violet-400 hover:text-ink-800 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:border-violet-300 dark:hover:text-ink-50',
  bare: 'rounded-md text-ink-400 hover:bg-ink-100/70 hover:text-ink-700 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-ink-50',
};

const baseClasses =
  'inline-grid shrink-0 place-items-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink-200 disabled:hover:bg-transparent disabled:hover:text-ink-400 dark:disabled:hover:border-ink-700 dark:disabled:hover:text-ink-300';

export function IconButton({
  icon,
  label,
  variant = 'square',
  size = 'md',
  tooltip,
  tooltipSide,
  className = '',
  ...rest
}: Props) {
  const button = (
    <button
      type="button"
      aria-label={label}
      {...rest}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon}
    </button>
  );
  if (!tooltip) return button;
  return (
    <Tooltip label={tooltip} side={tooltipSide}>
      {button}
    </Tooltip>
  );
}
