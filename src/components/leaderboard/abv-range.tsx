"use client";

export function AbvRangeFilter({
  min,
  max,
  ceiling,
  onMinChange,
  onMaxChange,
}: {
  min: number;
  max: number;
  ceiling: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}) {
  const span = ceiling <= 0 ? 1 : ceiling;
  const startPct = (min / span) * 100;
  const endPct = (max / span) * 100;

  return (
    <div className="w-64">
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted">
        <span>ABV</span>
        <span data-testid="abv-range-label">
          {min.toFixed(1)}% – {max.toFixed(1)}%
        </span>
      </div>
      <div className="abv-slider relative h-6">
        <div className="abv-slider-track" aria-hidden />
        <div
          className="abv-slider-fill"
          style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
          aria-hidden
        />
        <input
          id="abv-min"
          data-testid="abv-min"
          type="range"
          min={0}
          max={ceiling}
          step={0.1}
          value={min}
          aria-label="ABV min"
          className="abv-slider-thumb"
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isNaN(v)) return;
            onMinChange(Math.min(Math.max(0, v), max));
          }}
        />
        <input
          id="abv-max"
          data-testid="abv-max"
          type="range"
          min={0}
          max={ceiling}
          step={0.1}
          value={max}
          aria-label="ABV max"
          className="abv-slider-thumb"
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isNaN(v)) return;
            onMaxChange(Math.max(Math.min(v, ceiling), min));
          }}
        />
      </div>
    </div>
  );
}
