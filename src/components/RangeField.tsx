import type { CSSProperties } from 'react';
import { hintClass } from './ui';

interface Props {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  hint?: string;
}

export function RangeField({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled,
  hint,
}: Props) {
  const fill = max === min ? 100 : ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <output htmlFor={id} className="text-xl font-semibold tabular-nums text-ink">
          {value}
          <span className="text-base font-medium text-ink-3">{unit}</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-describedby={hint ? `${id}-hint` : undefined}
        style={{ '--fill': `${fill}%` } as CSSProperties}
        className="w-full"
      />
      {hint && (
        <p id={`${id}-hint`} className={hintClass}>
          {hint}
        </p>
      )}
    </div>
  );
}
