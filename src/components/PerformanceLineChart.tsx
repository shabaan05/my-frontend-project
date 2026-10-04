import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { DayStat } from '../utils/dateUtils';

interface Props {
  days: DayStat[];
  selectedDateKey: string | null;
  onSelectDay: (dateKey: string) => void;
  streakThreshold: number;
}

interface TooltipPayload {
  payload?: DayStat & { displayPct: number | null };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (!d || d.isFuture) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-slate-700 mb-1">
        {d.dayName} {d.dayNum}
      </p>
      <p className="text-slate-500">
        Completion: <span className="font-bold text-slate-800">{d.pct}%</span>
      </p>
      <p className="text-slate-500">{d.completed}/{d.total} habits</p>
    </div>
  );
}

// Recharts passes dot props as a generic object at runtime; use a loose type
// so we can read our custom fields without fighting the overload system.
type LooseDotProps = Record<string, unknown> & {
  cx?: number;
  cy?: number;
  payload?: DayStat & { displayPct: number | null };
};

function renderDot(selectedDateKey: string | null) {
  return function CustomDot(props: LooseDotProps) {
    const { cx, cy, payload } = props;
    if (!payload || payload.isFuture || cx == null || cy == null) return <g />;
    const isSelected = payload.dateKey === selectedDateKey;
    const isToday = payload.isToday;
    if (!isSelected && !isToday && payload.pct === 0) return <g />;
    return (
      <circle
        cx={cx as number}
        cy={cy as number}
        r={isSelected ? 5 : isToday ? 4 : 3}
        fill={isSelected ? '#7c3aed' : isToday ? '#6d28d9' : '#a78bfa'}
        stroke="white"
        strokeWidth={1.5}
      />
    );
  };
}

export default function PerformanceLineChart({ days, selectedDateKey, onSelectDay, streakThreshold }: Props) {
  const pastDays = days.filter((d) => !d.isFuture);
  const hasData = pastDays.some((d) => d.pct > 0);

  const chartData = days.map((d) => ({
    ...d,
    displayPct: d.isFuture ? null : d.pct,
  }));

  return (
    <div>
      {!hasData && (
        <p className="text-center text-slate-400 text-xs mb-2">
          Check off habits to see your trend line
        </p>
      )}
      <ResponsiveContainer width="100%" height={160}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 8, left: -28, bottom: 0 }}
          onClick={(e) => {
            const ev = e as unknown as { activePayload?: Array<{ payload?: { dateKey?: string } }> };
            const key = ev?.activePayload?.[0]?.payload?.dateKey;
            if (key) onSelectDay(key);
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="dayNum"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
          <ReferenceLine
            y={streakThreshold}
            stroke="#c4b5fd"
            strokeDasharray="4 3"
            strokeWidth={1.5}
          />
          <Line
            type="monotone"
            dataKey="displayPct"
            stroke="#a78bfa"
            strokeWidth={2}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={renderDot(selectedDateKey) as any}
            activeDot={{ r: 5, fill: '#7c3aed', stroke: 'white', strokeWidth: 2 }}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
