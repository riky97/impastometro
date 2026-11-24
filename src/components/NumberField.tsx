import { useState, type ReactNode } from 'react';
import { errorClass, hintClass, inputClass, labelClass } from './ui';

interface Props {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  /** Called when the field is emptied; makes the field optional. */
  onClear?: () => void;
  min?: number;
  max?: number;
  step?: number | 'any';
  unit?: string;
  hint?: string;
  error?: string;
  /** Mark invalid and point at an error shown elsewhere (shared by several fields). */
  invalid?: boolean;
  describedBy?: string;
  /** Controls shown on either side of the input (e.g. stepper buttons). */
  startSlot?: ReactNode;
  endSlot?: ReactNode;
  /** A big, centred figure: for the one number the step is about. */
  large?: boolean;
}

/** Numeric input that lets the user type freely and only reports valid numbers. */
export function NumberField({
  id,
  label,
  value,
  onChange,
  onClear,
  min,
  max,
  step = 'any',
  unit,
  hint,
  error,
  invalid,
  describedBy: externalDescribedBy,
  startSlot,
  endSlot,
  large,
}: Props) {
  // Text being typed; null while the field is not being edited.
  const [draft, setDraft] = useState<string | null>(null);
  const describedBy = [
    hint ? `${id}-hint` : null,
    error ? `${id}-error` : null,
    externalDescribedBy,
  ]
    .filter(Boolean)
    .join(' ');

  const handleChange = (text: string) => {
    setDraft(text);
    if (text.trim() === '') {
      onClear?.();
      return;
    }
    const parsed = Number(text.replace(',', '.'));
    if (Number.isFinite(parsed)) onChange(parsed);
  };

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {unit ? ` (${unit})` : ''}
      </label>
      <div className="flex gap-2">
        {startSlot}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={draft ?? (value === null ? '' : String(value))}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setDraft(null)}
          aria-invalid={error || invalid ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`${inputClass} min-w-0 grow ${large ? 'text-center text-3xl! font-semibold tabular-nums' : ''}`}
        />
        {endSlot}
      </div>
      {hint && (
        <p id={`${id}-hint`} className={hintClass}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      )}
    </div>
  );
}
