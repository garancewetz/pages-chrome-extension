import type { ComponentType, ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';

export type SectionAccent = 'violet' | 'sky' | 'amber';

type IconType = ComponentType<LucideProps>;

type Props = {
  icon: IconType;
  title: string;
  count?: number;
  accent: SectionAccent;
  actions?: ReactNode;
  id?: string;
};

const accentClasses: Record<SectionAccent, { wrap: string; gradient: string }> = {
  violet: {
    wrap: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-200',
    gradient:
      'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent dark:from-violet-300 dark:via-fuchsia-300 dark:to-rose-300',
  },
  sky: {
    wrap: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-200',
    gradient:
      'bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent dark:from-sky-300 dark:to-cyan-200',
  },
  amber: {
    wrap: 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
    gradient:
      'bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent dark:from-amber-300 dark:to-rose-300',
  },
};

export function SectionHeader({
  icon: Icon,
  title,
  count,
  accent,
  actions,
  id,
}: Props) {
  const a = accentClasses[accent];
  return (
    <header className="flex items-center gap-2.5">
      <span
        aria-hidden
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${a.wrap}`}
      >
        <Icon size={16} />
      </span>
      <h2
        id={id}
        className={`font-display text-base font-semibold tracking-tight ${a.gradient}`}
      >
        {title}
      </h2>
      {typeof count === 'number' ? (
        <span
          className="ml-0.5 text-sm font-medium text-ink-400 dark:text-ink-300"
          aria-hidden
        >
          {count}
        </span>
      ) : null}
      {actions ? <span className="ml-auto">{actions}</span> : null}
    </header>
  );
}
