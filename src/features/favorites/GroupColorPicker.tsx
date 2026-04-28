import { useEffect, useRef, useState } from 'react';
import { GROUP_COLORS, getColor, type GroupColorId } from '../../lib/groupColors';

type Props = {
  current: GroupColorId;
  groupName: string;
  onChange: (color: GroupColorId) => void;
};

export function GroupColorPicker({ current, groupName, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const currentColor = getColor(current);
  const alternatives = GROUP_COLORS.filter((c) => c.id !== current);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Couleur du groupe ${groupName} : ${currentColor.label}. Cliquer pour changer.`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-7 w-7 place-items-center rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
      >
        <span
          className="block h-4 w-4 rounded-full"
          style={{ backgroundColor: currentColor.dot }}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={`Choisir une autre couleur pour le groupe ${groupName}`}
          className="absolute left-0 top-full z-20 mt-1 flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white p-1.5 shadow-lg dark:border-ink-700 dark:bg-ink-800"
        >
          {alternatives.map((c) => (
            <button
              key={c.id}
              type="button"
              role="menuitem"
              aria-label={c.label}
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              className="grid h-7 w-7 place-items-center rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
            >
              <span
                className="block h-4 w-4 rounded-full"
                style={{ backgroundColor: c.dot }}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
