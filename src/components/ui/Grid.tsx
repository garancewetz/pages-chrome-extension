import type { ReactNode } from 'react';

type GridProps = {
  children: ReactNode;
  className?: string;
};

export function Grid({ children, className = '' }: GridProps) {
  return (
    <div
      className={`grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-[minmax(280px,1fr)] ${className}`}
    >
      {children}
    </div>
  );
}
