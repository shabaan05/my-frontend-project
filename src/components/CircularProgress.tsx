interface Props {
  pct: number;        // 0-100
  size?: number;      // px, default 88
  strokeWidth?: number;
  color?: string;     // stroke color
  trackColor?: string;
  label?: string;     // bottom label
  centerText?: string; // override center text (default: pct%)
}

export default function CircularProgress({
  pct,
  size = 88,
  strokeWidth = 8,
  color = '#7c3aed',
  trackColor = '#ede9fe',
  label,
  centerText,
}: Props) {
  const safe = Math.min(100, Math.max(0, isNaN(pct) ? 0 : pct));
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (safe / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={label ? `${label}: ${safe}%` : `${safe}%`}
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Center text */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.2}
          fontWeight="700"
          fill="#1e293b"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {centerText ?? `${safe}%`}
        </text>
      </svg>
      {label && (
        <span className="text-xs font-medium text-slate-500 text-center leading-tight">
          {label}
        </span>
      )}
    </div>
  );
}
