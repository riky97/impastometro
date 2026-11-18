import type { ReactNode } from 'react';
import { sectionTitle } from './ui';

export interface Choice<T extends string> {
  value: T;
  label: string;
  description?: string;
  badge?: ReactNode;
}

interface Props<T extends string> {
  legend: string;
  name: string;
  value: T;
  choices: readonly Choice<T>[];
  onChange: (value: T) => void;
  /** Stack the options instead of placing them side by side from the `sm` breakpoint. */
  stacked?: boolean;
}

/** Radio group drawn as selectable rows. Native radios keep keyboard and screen-reader support. */
export function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  choices,
  onChange,
  stacked = false,
}: Props<T>) {
  return (
    <fieldset>
      <legend className={`${sectionTitle} mb-2.5`}>{legend}</legend>
      <div className={`grid gap-2 ${stacked ? '' : 'sm:grid-cols-2'}`}>
        {choices.map((choice) => (
          <label
            key={choice.value}
            className="flex min-h-14 cursor-pointer flex-col justify-center rounded-control border border-line-strong bg-surface px-3.5 py-3 transition-colors hover:border-ink-3 has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50 has-[:checked]:shadow-[inset_0_0_0_1px_var(--color-brand-700)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-700"
          >
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <input
                type="radio"
                name={name}
                value={choice.value}
                checked={value === choice.value}
                onChange={() => onChange(choice.value)}
                className="size-5 shrink-0"
              />
              <span className="font-medium text-ink">{choice.label}</span>
              {choice.badge}
            </span>
            {choice.description && (
              <span className="mt-1 pl-[1.875rem] text-sm text-ink-3">{choice.description}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
