type Props = {
  children: React.ReactNode;
};

export function SubsectionTitle({ children }: Props) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-300">
      {children}
    </h3>
  );
}
