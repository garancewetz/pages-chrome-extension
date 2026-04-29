import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GROUP_COLORS, getColor, type GroupColorId } from '../../lib/groupColors';

type Props = {
  current: GroupColorId;
  groupName: string;
  onChange: (color: GroupColorId) => void;
};

const VIEWPORT_PADDING = 8;

export function GroupColorPicker({ current, groupName, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setCoords(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      left: Math.max(VIEWPORT_PADDING, rect.left),
      top: rect.bottom + 6,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (target && menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', () => setOpen(false));
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', () => setOpen(false));
    };
  }, [open]);

  const currentColor = getColor(current);
  const alternatives = GROUP_COLORS.filter((c) => c.id !== current);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Couleur du groupe ${groupName} : ${currentColor.label}. Cliquer pour changer.`}
        title="Changer la couleur"
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
      >
        <span
          className="block h-5 w-5 rounded-full ring-1 ring-black/10 dark:ring-white/15"
          style={{ backgroundColor: currentColor.dot }}
        />
      </button>

      {open && coords
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label={`Choisir une autre couleur pour le groupe ${groupName}`}
              style={{
                position: 'fixed',
                left: coords.left,
                top: coords.top,
                zIndex: 60,
              }}
              className="flex items-center gap-1.5 rounded-lg border-2 border-ink-200 bg-white p-1.5 shadow-xl dark:border-ink-700 dark:bg-ink-800"
            >
              {alternatives.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="menuitem"
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                  className="grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                >
                  <span
                    className="block h-5 w-5 rounded-full ring-1 ring-black/10 dark:ring-white/15"
                    style={{ backgroundColor: c.dot }}
                  />
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
