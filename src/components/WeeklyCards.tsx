import type { WeekStat } from '../utils/dateUtils';
import CircularProgress from './CircularProgress';

interface Props {
  weeks: WeekStat[];
}

const WEEK_COLORS = [
  { circle: '#60a5fa', track: '#dbeafe' },  // blue
  { circle: '#a78bfa', track: '#ede9fe' },  // violet
  { circle: '#34d399', track: '#d1fae5' },  // emerald
  { circle: '#f472b6', track: '#fce7f3' },  // pink
];

export default function WeeklyCards({ weeks }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {weeks.map((week, i) => {
        const colors = WEEK_COLORS[i] ?? WEEK_COLORS[0];
        const hasPastDays = week.days.some((d) => !d.isFuture);

        return (
          <div
            key={week.weekNum}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col items-center gap-3"
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Week {week.weekNum}
              </span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: colors.track,
                  color: colors.circle,
                }}
              >
                {week.days[0]?.dayNum}–{week.days[week.days.length - 1]?.dayNum}
              </span>
            </div>

            <CircularProgress
              pct={hasPastDays ? week.avgPct : 0}
              size={72}
              strokeWidth={7}
              color={colors.circle}
              trackColor={colors.track}
            />

            <div className="w-full space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Successful</span>
                <span className="font-semibold text-slate-600">
                  {week.successfulDays}d
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Missed</span>
                <span className="font-semibold text-slate-600">
                  {week.missedDays}d
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Completions</span>
                <span className="font-semibold text-slate-600">
                  {week.completedCount}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
