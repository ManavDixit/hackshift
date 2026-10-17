import { useId } from 'react';

interface BarDatum {
  label: string;
  value: number;
  color?: string;
  note?: string;
}

export function HBarChart({ data, unit }: { data: BarDatum[]; unit?: string }) {
  const uid = useId().replace(/:/g, '');
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3.5">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold text-ink">{d.label}</span>
            <span className="text-[13px] font-bold text-ink-soft tabular-nums">
              {unit === '₹' ? '₹' : ''}
              {d.value.toLocaleString('en-IN')}
              {unit && unit !== '₹' ? ` ${unit}` : ''}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/70">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: d.color ?? `linear-gradient(90deg,#3978F6,#14B8A6)`,
                transitionDelay: `${i * 60}ms`,
              }}
            />
          </div>
          {d.note && <p className="mt-1 text-[11.5px] text-ink-faint">{d.note}</p>}
        </div>
      ))}
    </div>
  );
}

export function ProgressRing({
  value,
  size = 96,
  stroke = 9,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5EBF3" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-${uid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <defs>
          <linearGradient id={`ring-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3978F6" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg font-bold leading-none text-ink">{Math.round(pct)}%</span>
        {label && <span className="mt-0.5 text-[10.5px] font-semibold text-ink-faint">{label}</span>}
      </div>
    </div>
  );
}

export function LineChart({ points, labels }: { points: number[]; labels: string[] }) {
  const w = 560;
  const h = 180;
  const pad = 24;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const x = (i: number) => pad + (i * (w - pad * 2)) / (points.length - 1);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p)}`).join(' ');
  const area = `${path} L${x(points.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Follow-up completion trend">
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3978F6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3978F6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)} stroke="#E5EBF3" strokeDasharray="4 4" />
      ))}
      <path d={area} fill="url(#lc-fill)" />
      <path d={path} fill="none" stroke="#3978F6" strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p)} r="3.5" fill="#fff" stroke="#3978F6" strokeWidth="2" />
      ))}
      {labels.map((l, i) => (
        <text key={l} x={x(i)} y={h - 6} textAnchor="middle" fontSize="10.5" fill="#69758B" fontWeight="600">
          {l}
        </text>
      ))}
    </svg>
  );
}
