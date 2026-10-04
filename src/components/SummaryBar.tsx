import type { AppData } from '../data/types';
import {
  calculateDailyPercentage,
  calculateCurrentStreak,
  calculateBestStreak,
  calculateOverallPercentage,
  getDateKey,
} from '../utils/dateUtils';

interface Props {
  data: AppData;
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent: string; // tailwind bg class
  iconChar: string;
}

function StatCard({ label, value, sub, accent, iconChar }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100 flex-1 min-w-[130px]">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${accent}`}
      >
        {iconChar}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide leading-tight">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function SummaryBar({ data }: Props) {
  const todayKey = getDateKey();
  const todayPct = calculateDailyPercentage(data, todayKey);
  const currentStreak = calculateCurrentStreak(data);
  const bestStreak = calculateBestStreak(data);
  const overallPct = calculateOverallPercentage(data);

  const todayDate = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateLabel = `${dayNames[todayDate.getDay()]}, ${monthNames[todayDate.getMonth()]} ${todayDate.getDate()}`;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-700">Today's Overview</h2>
        <span className="text-sm text-slate-400">{dateLabel}</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        <StatCard
          label="Today"
          value={`${todayPct}%`}
          sub="completion"
          accent="bg-blue-100 text-blue-600"
          iconChar="✦"
        />
        <StatCard
          label="Current Streak"
          value={`${currentStreak}d`}
          sub={currentStreak === 1 ? 'day in a row' : 'days in a row'}
          accent="bg-violet-100 text-violet-600"
          iconChar="🔥"
        />
        <StatCard
          label="Best Streak"
          value={`${bestStreak}d`}
          sub="personal best"
          accent="bg-pink-100 text-pink-600"
          iconChar="⭐"
        />
        <StatCard
          label="30-Day Avg"
          value={`${overallPct}%`}
          sub="overall average"
          accent="bg-emerald-100 text-emerald-600"
          iconChar="📈"
        />
      </div>
    </div>
  );
}
