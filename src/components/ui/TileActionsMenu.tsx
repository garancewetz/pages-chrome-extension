import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, MoreHorizontal } from 'lucide-react';
import { tileCornerInner } from './Tile';

export type TileActionsItem =
  | {
      kind: 'action';
      key: string;
      label: string;
      icon: ReactNode;
      onSelect: () => void;
      danger?: boolean;
      confirmLabel?: string;
    }
  | { kind: 'group-header'; key: string; label: string }
  | { kind: 'divider'; key: string };

type Props = {
  items: TileActionsItem[];
  triggerLabel: string;
  triggerTooltip: string;
};

const MENU_HEIGHT_ESTIMATE = 320;
const MENU_WIDTH = 240; // Doit rester en phase avec `w-60` ci-dessous (15rem).
const VIEWPORT_PADDING = 8;

type Coords = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

type TooltipPos = { centerX: number; bottom: number };

export function TileActionsMenu({ items, triggerLabel, triggerTooltip }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const showTooltip = !open && (hovering || focused);

  useLayoutEffect(() => {
    if (!showTooltip || !triggerRef.current) {
      setTooltipPos(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setTooltipPos({
      centerX: rect.left + rect.width / 2,
      bottom: window.innerHeight - rect.top + 6,
    });
  }, [showTooltip]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setCoords(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();

    // Vertical : ouvre vers le haut si peu de place en bas.
    const spaceBelow = window.innerHeight - rect.bottom;
    const goUp = spaceBelow < MENU_HEIGHT_ESTIMATE;
    const vertical = goUp
      ? { bottom: window.innerHeight - rect.top + 6 }
      : { top: rect.bottom + 6 };

    // Horizontal : on aligne par défaut le bord droit du menu sur le bord
    // droit du trigger. Si le menu déborderait à gauche, on bascule sur un
    // alignement à gauche du trigger.
    const rightOffset = window.innerWidth - rect.right;
    const wouldOverflowLeft =
      window.innerWidth - rightOffset - MENU_WIDTH < VIEWPORT_PADDING;
    const horizontal: Pick<Coords, 'left' | 'right'> = wouldOverflowLeft
      ? { left: Math.max(VIEWPORT_PADDING, rect.left) }
      : { right: Math.max(VIEWPORT_PADDING, rightOffset) };

    setCoords({ ...horizontal, ...vertical });
  }, [open]);

  useEffect(() => {
    if (!open) {
      setConfirmKey(null);
      return;
    }
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
    // Le scroll INTERNE au menu ne doit pas le fermer — on filtre sur la cible.
    const onScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (target && menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onResize = () => setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const runAction = (item: Extract<TileActionsItem, { kind: 'action' }>) => {
    if (item.confirmLabel && confirmKey !== item.key) {
      setConfirmKey(item.key);
      return;
    }
    item.onSelect();
    setOpen(false);
  };

  const baseItem =
    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`${tileCornerInner} hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-500/20 dark:hover:text-violet-200`}
      >
        <MoreHorizontal size={14} aria-hidden />
      </button>

      {showTooltip && tooltipPos
        ? createPortal(
            <span
              role="tooltip"
              style={{
                position: 'fixed',
                left: tooltipPos.centerX,
                bottom: tooltipPos.bottom,
                transform: 'translateX(-50%)',
                zIndex: 70,
              }}
              className="pointer-events-none whitespace-nowrap rounded-md border-2 border-ink-200 bg-white px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-700 shadow-sm dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
            >
              {triggerTooltip}
            </span>,
            document.body,
          )
        : null}

      {open && coords
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label={triggerLabel}
              style={{
                position: 'fixed',
                left: coords.left,
                right: coords.right,
                top: coords.top,
                bottom: coords.bottom,
                zIndex: 60,
              }}
              className="flex max-h-80 w-60 flex-col overflow-y-auto overscroll-contain rounded-xl border-2 border-ink-200 bg-white p-1.5 shadow-xl dark:border-ink-700 dark:bg-ink-800"
            >
              {items.map((item) => {
                if (item.kind === 'divider') {
                  return (
                    <hr
                      key={item.key}
                      className="my-1 border-t border-ink-200 dark:border-ink-700"
                    />
                  );
                }
                if (item.kind === 'group-header') {
                  return (
                    <span
                      key={item.key}
                      className="px-2.5 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-300"
                    >
                      {item.label}
                    </span>
                  );
                }
                const isConfirming = confirmKey === item.key;
                const idleStyle = item.danger
                  ? 'text-rose-700 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-500/20'
                  : 'text-ink-700 hover:bg-violet-50 dark:text-ink-100 dark:hover:bg-violet-500/20';
                const confirmStyle =
                  'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400';
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      runAction(item);
                    }}
                    onBlur={() => setConfirmKey(null)}
                    className={`${baseItem} ${isConfirming ? confirmStyle : idleStyle}`}
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center">
                      {isConfirming ? (
                        <Check size={18} aria-hidden />
                      ) : (
                        item.icon
                      )}
                    </span>
                    <span className="flex-1 truncate">
                      {isConfirming ? item.confirmLabel : item.label}
                    </span>
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
