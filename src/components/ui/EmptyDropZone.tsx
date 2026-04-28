type Props = {
  children: React.ReactNode;
  size?: 'sm' | 'md';
};

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'p-5 text-sm',
  md: 'p-6 text-sm',
};

export function EmptyDropZone({ children, size = 'md' }: Props) {
  return (
    <li
      className={`col-span-full grid place-items-center rounded-xl border-2 border-dashed border-ink-300/60 bg-white/30 text-center text-ink-500 dark:border-ink-700/60 dark:bg-white/[0.02] dark:text-ink-300 ${sizeClasses[size]}`}
    >
      {children}
    </li>
  );
}
