type Props = {
  size?: number;
  className?: string;
};

export function Logo({ size = 22, className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`shrink-0 drop-shadow-[0_2px_8px_rgba(139,92,246,0.35)] ${className ?? ''}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="logo-rose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="logo-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="32" height="56" rx="8" fill="url(#logo-violet)" />
      <rect x="40" y="4" width="20" height="26" rx="6" fill="url(#logo-rose)" />
      <rect x="40" y="34" width="20" height="26" rx="6" fill="url(#logo-sky)" />
    </svg>
  );
}
