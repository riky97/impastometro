import type { ProductId } from '../data/profiles';
import { ClassicaIcon, ContemporaneaIcon, LoafIcon, ReccoIcon, TrayIcon } from './icons';

const ICONS: Record<ProductId, () => React.ReactNode> = {
  classica: () => <ClassicaIcon />,
  contemporanea: () => <ContemporaneaIcon />,
  genovese: () => <TrayIcon />,
  recco: () => <ReccoIcon />,
  pane: () => <LoafIcon />,
};

/** The product's drawn icon on a soft basil tile. */
export function ProductIcon({ product }: { product: ProductId }) {
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-control bg-brand-50 text-brand-700">
      {ICONS[product]()}
    </span>
  );
}
