import type { ComponentType, ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';

export type SectionAccent = 'violet' | 'sky';

type IconType = ComponentType<LucideProps>;

type Props = {
  icon: IconType;
  title: string;
  count?: number;
  accent: SectionAccent;
  actions?: ReactNode;
  id?: string;
};

const accentClasses: Record<SectionAccent, { wrap: string; title: string }> = {
  violet: {
    wrap: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-200',
    title: 'text-violet-700 dark:text-violet-200',
  },
  sky: {
    wrap: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-200',
    title: 'text-sky-700 dark:text-sky-200',
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
        className={`font-display text-lg font-semibold tracking-tight ${a.title}`}
      >
        {title}
      </h2>
      {typeof count === 'number' ? (
        <span
          className="ml-0.5 text-base font-semibold text-ink-600 dark:text-ink-200"
          aria-hidden
        >
          {count}
        </span>
      ) : null}
      {actions ? <span className="ml-auto">{actions}</span> : null}
    </header>
  );
}
