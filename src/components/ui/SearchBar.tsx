type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher…',
}: SearchBarProps) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink placeholder:text-muted focus:border-accent-border focus:outline-none focus:ring-2 focus:ring-accent-border"
    />
  );
}
