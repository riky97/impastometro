export const OVEN_IDS = ['electric', 'gas', 'wood', 'home'] as const;
export type OvenId = (typeof OVEN_IDS)[number];

export const OVENS: Record<OvenId, { id: OvenId; label: string }> = {
  electric: { id: 'electric', label: 'Elettrico per pizza' },
  gas: { id: 'gas', label: 'Forno a gas' },
  wood: { id: 'wood', label: 'Forno a legna' },
  home: { id: 'home', label: 'Forno di casa (statico)' },
};

export const DEFAULT_OVEN: OvenId = 'gas';
