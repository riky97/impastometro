import { useState, type ReactNode } from 'react';
import { unitName } from '../data/messages.it';
import type { RecipeSummary } from '../state/summary';
import { ChevronRightIcon } from './icons';
import { ProductIcon } from './ProductIcon';
import { btnPrimary, inputClass } from './ui';

interface Props {
  name: string;
  summary: RecipeSummary;
  /** The whole top of the card opens the recipe. */
  onOpen: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

const ghost =
  'min-h-11 rounded-control px-1 text-sm font-medium text-ink-2 transition-colors hover:bg-brand-50';

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="font-medium tabular-nums text-ink">{children}</dd>
    </div>
  );
}

/** A saved recipe: tap anywhere on the top to open it; the three actions sit below. */
export function RecipeCard({ name, summary, onOpen, onRename, onDuplicate, onRemove }: Props) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <li className="rounded-2xl border border-line bg-surface">
      <div className="relative">
        <div className="flex items-center gap-3 p-4">
          <ProductIcon product={summary.pizzaId} />
          <div className="min-w-0 grow">
            {draft === null ? (
              <h3 className="text-base font-semibold text-ink">{name}</h3>
            ) : (
              <form
                className="relative z-10 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  onRename(draft);
                  setDraft(null);
                }}
              >
                <input
                  aria-label="Nome della ricetta"
                  className={`${inputClass} min-w-0 grow`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                />
                <button type="submit" className={`${btnPrimary} min-h-12 px-4`}>
                  Salva nome
                </button>
              </form>
            )}
            <p className="text-sm text-ink-2">
              <span className="text-2xl font-semibold tracking-tight tabular-nums text-ink">
                {summary.balls}
              </span>{' '}
              {unitName(summary.unit, summary.balls)} da {summary.ballWeightG} g
            </p>
          </div>
          {draft === null && <ChevronRightIcon className="size-5 shrink-0 text-ink-3" />}
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line px-4 py-3 text-sm">
          <Fact label="Idratazione">{summary.hydrationPct}%</Fact>
          <Fact label="Farina">{summary.flourG} g</Fact>
          <Fact label="Forno">{summary.oven}</Fact>
        </dl>
        {draft === null && (
          <button
            type="button"
            aria-label={`Vedi ricetta: ${name}`}
            className="absolute inset-0 rounded-t-2xl hover:bg-brand-50/40"
            onClick={onOpen}
          />
        )}
      </div>
      <div className="grid grid-cols-3 border-t border-line">
        <button type="button" className={ghost} onClick={onDuplicate}>
          Duplica
        </button>
        <button type="button" className={ghost} onClick={() => setDraft(name)}>
          Rinomina
        </button>
        <button type="button" className={ghost} onClick={onRemove}>
          Elimina
        </button>
      </div>
    </li>
  );
}
