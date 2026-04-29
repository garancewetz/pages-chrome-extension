type Props = {
  children: React.ReactNode;
};

export function SubsectionTitle({ children }: Props) {
  return (
    <h3 className="text-base font-semibold uppercase tracking-wider text-ink-600 dark:text-ink-200">
      {children}
    </h3>
  );
}
