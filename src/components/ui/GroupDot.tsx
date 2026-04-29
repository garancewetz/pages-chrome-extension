type Props = {
  color: string;
};

export function GroupDot({ color }: Props) {
  return (
    <span
      aria-hidden
      className="block h-3.5 w-3.5 rounded-full ring-1 ring-black/10 dark:ring-white/15"
      style={{ backgroundColor: color }}
    />
  );
}
