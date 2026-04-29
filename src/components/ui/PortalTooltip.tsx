import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type Side = 'top' | 'bottom';

type Props = {
  label: string;
  children: ReactNode;
  side?: Side;
};

type Pos = { centerX: number; top?: number; bottom?: number };

/**
 * Tooltip rendu dans `document.body` via createPortal.
 * À utiliser quand l'élément cible vit dans un parent `overflow-hidden`
 * (Tile, GroupCard) qui couperait un tooltip standard `position: absolute`.
 */
export function PortalTooltip({ label, children, side = 'bottom' }: Props) {
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const visible = hovering || focused;

  useLayoutEffect(() => {
    if (!visible || !ref.current) {
      setPos(null);
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    setPos({
      centerX: rect.left + rect.width / 2,
      ...(side === 'top'
        ? { bottom: window.innerHeight - rect.top + 6 }
        : { top: rect.bottom + 6 }),
    });
  }, [visible, side]);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => {
      setHovering(false);
      setFocused(false);
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [visible]);

  return (
    <>
      <span
        ref={ref}
        className="inline-flex"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
      </span>
      {visible && pos
        ? createPortal(
            <span
              role="tooltip"
              style={{
                position: 'fixed',
                left: pos.centerX,
                top: pos.top,
                bottom: pos.bottom,
                transform: 'translateX(-50%)',
                zIndex: 70,
              }}
              className="pointer-events-none whitespace-nowrap rounded-md border-2 border-ink-200 bg-white px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-700 shadow-sm dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
