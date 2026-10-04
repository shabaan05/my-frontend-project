import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  payload?: DayStat;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (!d || d.isFuture) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-xs min-w-[120px]">
      <p className="font-semibold text-slate-700 mb-1">
        {d.dayName} {d.dayNum}
      </p>
      <p className="text-slate-500">
        Completion: <span className="font-bold text-slate-800">{d.pct}%</span>
      </p>
      <p className="text-slate-500">
        {d.completed}/{d.total} habits
      </p>
      {d.isSuccessful && (
        <p className="text-emerald-500 font-medium mt-0.5">✓ Streak day</p>
      )}
    </div>
  );
}

function getBarColor(d: DayStat, isSelected: boolean): string {
  if (d.isFuture) return '#f1f5f9';
  if (isSelected) return '#7c3aed';
  if (d.pct === 100) return '#10b981';
  if (d.pct >= 70) return '#60a5fa';
  if (d.pct >= 40) return '#fbbf24';
  if (d.pct > 0) return '#f87171';
  return '#e2e8f0';
}

export default function DailyBarChart({ days, selectedDateKey, onSelectDay, streakThreshold }: Props) {
  const hasData = days.some((d) => !d.isFuture && d.pct > 0);

  if (days.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        No data yet
      </div>
    );
  }

  // Recharts wants plain objects — DayStat already is one
  const chartData = days.map((d) => ({
    ...d,
    displayPct: d.isFuture ? 0 : d.pct,
  }));

  return (
    <div>
      {!hasData && (
        <p className="text-center text-slate-400 text-xs mb-2">
          Check off habits to see your progress here
        </p>
      )}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
          barCategoryGap="20%"
          onClick={(e) => {
            // recharts passes a generic object; cast to access activePayload
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <ReferenceLine
            y={streakThreshold}
            stroke="#c4b5fd"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{ value: `${streakThreshold}%`, position: 'right', fontSize: 9, fill: '#a78bfa' }}
          />
          <Bar dataKey="displayPct" radius={[3, 3, 0, 0]} maxBarSize={18} isAnimationActive={false}>
            {chartData.map((d) => (
              <Cell
                key={d.dateKey}
                fill={getBarColor(d, d.dateKey === selectedDateKey)}
                style={{ cursor: d.isFuture ? 'default' : 'pointer' }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-3 mt-1 px-1 flex-wrap">
        {[
          { color: '#10b981', label: '100%' },
          { color: '#60a5fa', label: '≥70%' },
          { color: '#fbbf24', label: '40–69%' },
          { color: '#f87171', label: '<40%' },
          { color: '#e2e8f0', label: 'No data' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
