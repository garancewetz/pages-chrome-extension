import type { ReactNode } from 'react';

type Side = 'top' | 'bottom';

type Props = {
  label: string;
  children: ReactNode;
  side?: Side;
  className?: string;
};

const sidePosition: Record<Side, string> = {
  top: 'bottom-full mb-1.5',
  bottom: 'top-full mt-1.5',
};

export function Tooltip({ label, children, side = 'bottom', className }: Props) {
  // The wrapper must be positioned (relative or absolute) so the floating
  // tooltip span anchors against it. If a custom className is provided, it
  // replaces the default layout — the caller must include a position class.
  const layout = className ?? 'relative inline-flex';
  return (
    <span className={`group/tooltip ${layout}`}>
      {children}
      <span
        aria-hidden
        className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-ink-200 bg-white px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-700 opacity-0 shadow-sm transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 ${sidePosition[side]}`}
      >
        {label}
      </span>
    </span>
  );
}
