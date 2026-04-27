import { Search } from 'lucide-react';

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
    <div className="relative">
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/50 bg-white/55 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-xl shadow-sm shadow-black/5 focus:border-violet-400/60 focus:outline-none focus:ring-4 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </div>
  );
}
