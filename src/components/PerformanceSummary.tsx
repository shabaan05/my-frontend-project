import type { MonthStat } from '../utils/dateUtils';
import { calculateCurrentStreak, calculateBestStreak } from '../utils/dateUtils';
import type { AppData } from '../data/types';

interface Props {
  monthly: MonthStat;
  data: AppData;
}

interface TileProps {
  label: string;
  value: string | number;
  sub?: string;
  accentBg: string;
  accentText: string;
  icon: string;
}

function Tile({ label, value, sub, accentBg, accentText, icon }: TileProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${accentBg}`}
      >
        <span role="img" aria-hidden>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none mb-1">
          {label}
        </p>
        <p className={`text-xl font-bold leading-none ${accentText}`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-1 leading-tight">{sub}</p>}
      </div>
    </div>
  );
}

export default function PerformanceSummary({ monthly, data }: Props) {
  const currentStreak = calculateCurrentStreak(data);
  const bestStreak = calculateBestStreak(data);
  const pastDays = monthly.days.filter((d) => !d.isFuture).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <Tile
        label="Overall Average"
        value={`${monthly.overallAvg}%`}
        sub={`across ${pastDays} days`}
        accentBg="bg-blue-50"
        accentText="text-blue-600"
        icon="📊"
      />
      <Tile
        label="Current Streak"
        value={`${currentStreak}d`}
        sub="consecutive days"
        accentBg="bg-orange-50"
        accentText="text-orange-500"
        icon="🔥"
      />
      <Tile
        label="Best Streak"
        value={`${bestStreak}d`}
        sub="personal record"
        accentBg="bg-yellow-50"
        accentText="text-yellow-600"
        icon="⭐"
      />
      <Tile
        label="Perfect Days"
        value={monthly.perfectDays}
        sub="100% completion"
        accentBg="bg-emerald-50"
        accentText="text-emerald-600"
        icon="✨"
      />
      <Tile
        label="Successful Days"
        value={monthly.successfulDays}
        sub="≥70% completion"
        accentBg="bg-violet-50"
        accentText="text-violet-600"
        icon="✅"
      />
      <Tile
        label="Low Days"
        value={monthly.lowDays}
        sub="below 40%"
        accentBg="bg-rose-50"
        accentText="text-rose-500"
        icon="📉"
      />
    </div>
  );
}
