import { inputClass, labelClass } from './ui';

interface Props {
  id: string;
  label: string;
  /** `YYYY-MM-DDTHH:mm` in local time, or anything else while the date is unset. */
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const HOURS = Array.from({ length: 24 }, (_, h) => pad(h));
const MINUTE_STEPS = Array.from({ length: 12 }, (_, i) => pad(i * 5));

/**
 * Date plus 24-hour time. A native datetime-local follows the OS locale and shows AM/PM, so
 * the time is two selects instead; the stored string stays `YYYY-MM-DDTHH:mm`.
 */
export function DateTimeField({ id, label, value, onChange, invalid, describedBy }: Props) {
  const [date = '', time = ''] = value.split('T');
  const [hour = '00', minute = '00'] = time.split(':');
  // A minute that is not a multiple of 5 (e.g. the default "now") stays selectable.
  const minutes = MINUTE_STEPS.includes(minute) ? MINUTE_STEPS : [...MINUTE_STEPS, minute].sort();
  const emit = (d: string, h: string, m: string) => onChange(d ? `${d}T${h}:${m}` : '');
  const a11y = { 'aria-invalid': invalid ? true : undefined, 'aria-describedby': describedBy };

  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      <div className="grid grid-cols-[minmax(0,1fr)_4.75rem_4.75rem] gap-2">
        <input
          id={id}
          type="date"
          aria-label={`${label}, data`}
          className={`${inputClass} min-w-0`}
          value={date}
          onChange={(e) => emit(e.target.value, hour, minute)}
          {...a11y}
        />
        <select
          aria-label={`${label}, ore`}
          className={`${inputClass} min-w-0 px-2.5 tabular-nums`}
          value={hour}
          onChange={(e) => emit(date, e.target.value, minute)}
          {...a11y}
        >
          {HOURS.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </select>
        <select
          aria-label={`${label}, minuti`}
          className={`${inputClass} min-w-0 px-2.5 tabular-nums`}
          value={minute}
          onChange={(e) => emit(date, hour, e.target.value)}
          {...a11y}
        >
          {minutes.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
