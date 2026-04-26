import type { ReactNode } from 'react';

type CardProps = {
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Card({ title, action, className = '', children }: CardProps) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-border bg-surface p-4 shadow-card ${className}`}
    >
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between">
          {title && <h2 className="text-base font-medium text-ink">{title}</h2>}
          {action}
        </header>
      )}
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  );
}
