import { useEffect, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Tooltip } from './Tooltip';

type Props = {
  onConfirm: () => void;
  idleIcon: ReactNode;
  idleLabel: string;
  confirmLabel: string;
  className?: string;
  idleClassName?: string;
  confirmClassName?: string;
  tooltip?: string;
  tooltipSide?: 'top' | 'bottom';
  wrapperClassName?: string;
};

export function ConfirmIconButton({
  onConfirm,
  idleIcon,
  idleLabel,
  confirmLabel,
  className = '',
  idleClassName = '',
  confirmClassName = 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400',
  tooltip,
  tooltipSide,
  wrapperClassName,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  const handleClick = () => {
    if (confirming) {
      onConfirm();
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

  const button = (
    <button
      type="button"
      aria-label={confirming ? confirmLabel : idleLabel}
      title={confirming ? 'Cliquez à nouveau pour confirmer' : undefined}
      aria-pressed={confirming}
      onClick={handleClick}
      onBlur={() => setConfirming(false)}
      className={`${className} ${confirming ? confirmClassName : idleClassName}`}
    >
      {confirming ? <Check size={16} aria-hidden /> : idleIcon}
    </button>
  );

  if (!tooltip || confirming) {
    if (!wrapperClassName) return button;
    return <span className={wrapperClassName}>{button}</span>;
  }
  return (
    <Tooltip label={tooltip} side={tooltipSide} className={wrapperClassName}>
      {button}
    </Tooltip>
  );
}
