type Props = {
  children: React.ReactNode;
  size?: 'sm' | 'md';
};

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'p-5 text-base',
  md: 'p-6 text-base',
};

export function EmptyDropZone({ children, size = 'md' }: Props) {
  return (
    <li
      className={`col-span-full grid place-items-center rounded-xl border-2 border-dashed border-ink-300/60 bg-white/30 text-center text-ink-600 dark:border-ink-700/60 dark:bg-white/[0.02] dark:text-ink-200 ${sizeClasses[size]}`}
    >
      {children}
    </li>
  );
}
