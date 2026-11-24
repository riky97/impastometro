import { EXTRA_LABELS, unitName } from '../data/messages.it';
import type { CalcResult } from '../engine/calculate';
import { cardClass, sectionTitle } from './ui';

const number = new Intl.NumberFormat('it-IT');

interface Props {
  result: CalcResult;
  showDryYeast: boolean;
  onToggleYeast: (showDry: boolean) => void;
}

function Row({ name, grams, note }: { name: string; grams: number; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="min-w-0 text-ink">
        {name}
        {note && <span className="block text-sm font-medium text-ink-2">{note}</span>}
      </dt>
      <dd className="shrink-0 text-2xl font-semibold tabular-nums text-ink">
        {number.format(grams)}
        <span className="ml-1 text-base font-medium text-ink-3">g</span>
      </dd>
    </div>
  );
}

export function IngredientList({ result, showDryYeast, onToggleYeast }: Props) {
  const { ingredients: ing, targetDoughTempC: target, balls } = result;
  const yeastG = showDryYeast ? ing.dryYeastG : ing.freshYeastG;
  const yeastNote = ing.yeastNeedsDilution
    ? 'Quantità minima: scioglila in poca acqua e usane una parte'
    : undefined;
  return (
    <section className={cardClass} aria-labelledby="ingredients-title">
      <h2 id="ingredients-title" className={`${sectionTitle} text-lg`}>
        Ingredienti
      </h2>
      <p className="mt-1 font-semibold tabular-nums text-ink">
        {balls.count} {unitName(result.unit, balls.count)} da {balls.weightG} g
        {balls.leftoverG > 0 && <> + {balls.leftoverG} g di impasto avanzato</>}.
      </p>
      <dl className="mt-1 divide-y divide-line">
        <Row name="Farina" grams={ing.flourG} />
        <Row
          name="Acqua"
          grams={ing.waterG}
          note={result.leavened ? `a ${number.format(result.waterTempC)} °C` : undefined}
        />
        {result.leavened && (
          <Row
            name={showDryYeast ? 'Lievito secco' : 'Lievito di birra fresco'}
            grams={yeastG}
            note={yeastNote}
          />
        )}
        <Row name="Sale" grams={ing.saltG} />
        {ing.oilG > 0 && <Row name="Olio d'oliva" grams={ing.oilG} />}
      </dl>
      {result.extras.length > 0 && (
        <>
          <h3 className="mt-3 border-t border-line pt-3 text-sm font-medium text-ink-2">
            Oltre all'impasto
          </h3>
          <dl className="divide-y divide-line">
            {result.extras.map((e) => (
              <Row key={e.id} name={EXTRA_LABELS[e.id]} grams={e.g} />
            ))}
          </dl>
        </>
      )}
      {result.leavened && (
        <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink-2">
          <input
            type="checkbox"
            className="size-5"
            checked={showDryYeast}
            onChange={(e) => onToggleYeast(e.target.checked)}
          />
          Mostra il lievito secco (1/3 del fresco)
        </label>
      )}
      {result.leavened && (
        <p className="mt-2 border-t border-line pt-3 text-sm text-ink-2">
          Temperatura dell'impasto dopo l'impasto:{' '}
          <strong className="font-semibold whitespace-nowrap text-ink">
            {target.min}–{target.max}
            {' '}°C
          </strong>
          .
        </p>
      )}
    </section>
  );
}
