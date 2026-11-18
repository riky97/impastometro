import { useState, type ReactNode } from 'react';
import type { PizzaId } from '../data/profiles';
import { ClassicaIcon, ContemporaneaIcon } from './icons';
import { btnPrimary, inputClass } from './ui';

export interface RecipeSummary {
  pizzaId: PizzaId;
  pizza: string;
  /** One line on the pizza style, from the profile. */
  character: string;
  balls: number;
  ballWeightG: number;
  hydrationPct: number;
  flourG: number;
  method: string;
  oven: string;
}

interface Props {
  name: string;
  summary: RecipeSummary;
  /** Replaces the pizza-style line under the name, e.g. the step of the unfinished calculation. */
  subtitle?: string;
  /** The unfinished calculation: marked by a green border, not a label. */
  highlight?: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  /** Rename and delete; omitted for the in-progress card. */
  onRename?: (name: string) => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
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

export function RecipeCard({
  name,
  summary,
  subtitle,
  highlight,
  primaryLabel,
  onPrimary,
  onRename,
  onDuplicate,
  onRemove,
}: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  // The default recipe name already starts with the style, so the line would repeat it.
  const meta = subtitle ?? (name.startsWith(summary.pizza) ? null : summary.pizza);

  return (
    <li
      className={`rounded-2xl border bg-surface p-4 sm:p-5 ${highlight ? 'border-brand-600' : 'border-line'}`}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-control bg-brand-50 text-brand-700">
          {summary.pizzaId === 'classica' ? <ClassicaIcon /> : <ContemporaneaIcon />}
        </span>
        <div className="min-w-0 grow">
          {draft === null ? (
            <h3 className="text-base font-semibold text-ink">{name}</h3>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                onRename?.(draft);
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
          {meta && <p className="text-sm text-ink-3">{meta}</p>}
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums text-ink">
        {summary.balls}
        <span className="ml-2 text-base font-medium text-ink-2">
          panetti da {summary.ballWeightG} g
        </span>
      </p>
      <p className="mt-1.5 text-sm text-ink-2">{summary.character}</p>
      <dl className="mt-3 grid grid-cols-2 border-t border-line pt-3 gap-x-4 gap-y-2 text-sm">
        <Fact label="Idratazione">{summary.hydrationPct}%</Fact>
        <Fact label="Farina">{summary.flourG} g</Fact>
        <Fact label="Impasto">{summary.method}</Fact>
        <Fact label="Forno">{summary.oven}</Fact>
      </dl>
      <div className="mt-4 space-y-1">
        <button type="button" className={`${btnPrimary} min-h-11 w-full`} onClick={onPrimary}>
          {primaryLabel}
        </button>
        <div className="grid grid-cols-3">
          {onDuplicate && (
            <button type="button" className={ghost} onClick={onDuplicate}>
              Duplica
            </button>
          )}
          {onRename && (
            <button type="button" className={ghost} onClick={() => setDraft(name)}>
              Rinomina
            </button>
          )}
          {onRemove && (
            <button type="button" className={ghost} onClick={onRemove}>
              Elimina
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
