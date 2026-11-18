export function ProgressBar({ confirmedCount, total }: { confirmedCount: number; total: number }) {
  return (
    <div>
      <p className="mb-1 text-xs text-ink-2">
        {confirmedCount} di {total} passaggi confermati
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={confirmedCount}
        aria-label="Passaggi confermati"
        className="h-1 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-brand-700 transition-[width] duration-300 ease-out"
          style={{ width: `${(confirmedCount / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
