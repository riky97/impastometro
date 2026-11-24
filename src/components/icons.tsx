/** Drawn icons: one 1.75 stroke, round caps, 20 px grid. Decorative, so hidden from screen readers. */
interface IconProps {
  className?: string;
}

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 8l4 4 4-4" />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 10h10" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 10h10M10 5v10" />
    </svg>
  );
}

const pizza = { ...base, width: 28, height: 28, viewBox: '0 0 28 28' };

/** Classica: a thin rim and a basil leaf. */
export function ClassicaIcon({ className }: IconProps) {
  return (
    <svg {...pizza} className={className}>
      <circle cx="14" cy="14" r="10.5" />
      <circle cx="14" cy="14" r="8.2" />
      <path d="M11 15c0-3 2-4.6 5-4.6 0 3-2 4.8-5 4.6Z" />
      <path d="M11 15l3.2-2.6" />
    </svg>
  );
}

/** Contemporanea: a tall airy rim. */
export function ContemporaneaIcon({ className }: IconProps) {
  return (
    <svg {...pizza} className={className}>
      <circle cx="14" cy="14" r="10.5" />
      <circle cx="14" cy="14" r="6.4" />
      <path d="M12 14.5l2-1.6 2 1.6" />
      <path d="M14 5.6h.01M22.2 14h.01M14 22.4h.01M5.8 14h.01" strokeWidth="2.2" />
    </svg>
  );
}

/** Genovese: a tray with finger dimples. */
export function TrayIcon({ className }: IconProps) {
  return (
    <svg {...pizza} className={className}>
      <rect x="3.5" y="7" width="21" height="14" rx="3" />
      <path d="M9 12h.01M14 11h.01M19 12h.01M11.5 16.5h.01M16.5 16.5h.01" strokeWidth="2.2" />
    </svg>
  );
}

/** Recco: a round pan with a sealed edge. */
export function ReccoIcon({ className }: IconProps) {
  return (
    <svg {...pizza} className={className}>
      <circle cx="14" cy="14" r="10.5" />
      <circle cx="14" cy="14" r="7" strokeDasharray="1.5 3" />
    </svg>
  );
}

/** Pane: a loaf with three slashes. */
export function LoafIcon({ className }: IconProps) {
  return (
    <svg {...pizza} className={className}>
      <path d="M4.5 19.5v-2.5c0-4.5 4-8 9.5-8s9.5 3.5 9.5 8v2.5Z" />
      <path d="M10 13l1.8 3.4M14 12.2l1.8 3.4M18 13l1.8 3.4" />
    </svg>
  );
}
