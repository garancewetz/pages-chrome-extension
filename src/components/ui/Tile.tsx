import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { getHostname } from '../../lib/url';

// Bouton de coin (utilisé par BookmarkTile / DraggableTab via les slots de Tile).
// Visuels complets : taille, bord, fond, hover. Le slot Tile s'occupe juste de
// la position absolue et de la visibilité au survol.
export const tileCornerInner =
  'grid h-7 w-7 place-items-center rounded-md border-2 border-ink-200 bg-white text-ink-600 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:border-ink-700 dark:bg-ink-700 dark:text-ink-100';

const tileShellBase =
  'group/tile relative aspect-square overflow-hidden rounded-2xl border-2 border-ink-200 bg-gradient-to-br from-white to-violet-50/60 shadow-[0_2px_6px_-3px_rgba(67,56,135,0.1)] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-[0_10px_28px_-14px_rgba(139,92,246,0.55)] dark:border-ink-700/70 dark:from-ink-800/80 dark:to-ink-800/40 dark:shadow-none dark:hover:border-violet-300 dark:hover:shadow-[0_10px_28px_-14px_rgba(139,92,246,0.6)]';

const slotBase = 'absolute z-10 inline-flex';

type TileProps = {
  children: ReactNode;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  bottomRight?: ReactNode;
  onActivate?: () => void;
  activateLabel?: string;
  style?: CSSProperties;
  className?: string;
};

export const Tile = forwardRef<HTMLLIElement, TileProps>(function Tile(
  {
    children,
    topLeft,
    topRight,
    bottomRight,
    onActivate,
    activateLabel,
    style,
    className,
  },
  ref,
) {
  return (
    <li
      ref={ref}
      style={style}
      className={`${tileShellBase} min-w-0 ${className ?? ''}`}
    >
      {onActivate ? (
        <button
          type="button"
          onClick={onActivate}
          aria-label={activateLabel}
          className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
        />
      ) : null}
      {children}
      {topLeft ? (
        <span className={`${slotBase} left-1.5 top-1.5`}>{topLeft}</span>
      ) : null}
      {topRight ? (
        <span className={`${slotBase} right-1.5 top-1.5`}>{topRight}</span>
      ) : null}
      {bottomRight ? (
        <span className={`${slotBase} bottom-1.5 right-1.5`}>{bottomRight}</span>
      ) : null}
    </li>
  );
});

type TilePreviewProps = {
  children: ReactNode;
};

export function TilePreview({ children }: TilePreviewProps) {
  return (
    <div
      className={`${tileShellBase} flex aspect-square w-28 min-w-0 flex-col items-center justify-center gap-1.5 p-2 text-center shadow-[0_18px_45px_-18px_rgba(15,23,42,0.45)]`}
    >
      {children}
    </div>
  );
}

type TileBodyProps = {
  favicon: ReactNode;
  title: ReactNode;
  url: string;
};

export function TileBody({ favicon, title, url }: TileBodyProps) {
  return (
    <div className="pointer-events-none relative z-[1] flex h-full w-full min-w-0 flex-col items-center justify-center gap-1.5 p-2 text-center">
      {favicon}
      {title}
      <span
        aria-hidden
        className="w-full truncate text-2xs text-ink-400/80 dark:text-ink-400"
      >
        {getHostname(url)}
      </span>
    </div>
  );
}
