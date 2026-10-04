import type { AppData } from '../data/types';
import {
  calculateDailyPercentage,
  calculateCurrentStreak,
  calculateBestStreak,
  calculateOverallPercentage,
  getCurrentWeekAvg,
  getDateKey,
} from '../utils/dateUtils';

interface Props {
  data: AppData;
}

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  icon: string;
}

function Stat({ label, value, sub, accent, icon }: StatProps) {
  return (
    <div className={`flex-1 min-w-[100px] rounded-2xl border p-4 flex flex-col gap-1 ${accent}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wide text-current opacity-60">{label}</span>
        <span className="text-base leading-none" role="img" aria-hidden>{icon}</span>
      </div>
      <p className="text-2xl font-black leading-none text-slate-800">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 leading-tight">{sub}</p>}
    </div>
  );
}

export default function QuickStats({ data }: Props) {
  const todayKey      = getDateKey();
  const todayPct      = calculateDailyPercentage(data, todayKey);
  const weekAvg       = getCurrentWeekAvg(data);
  const monthAvg      = calculateOverallPercentage(data);
  const curStreak     = calculateCurrentStreak(data);
  const bestStreak    = calculateBestStreak(data);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <h2 className="text-base font-bold text-slate-800">Quick Stats</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        <Stat
          label="Today"
          value={`${todayPct}%`}
          sub="completion"
          accent="bg-violet-50 border-violet-100"
          icon="✦"
        />
        <Stat
          label="This Week"
          value={`${weekAvg}%`}
          sub="weekly avg"
          accent="bg-blue-50 border-blue-100"
          icon="📅"
        />
        <Stat
          label="30-Day Avg"
          value={`${monthAvg}%`}
          sub="overall"
          accent="bg-emerald-50 border-emerald-100"
          icon="📈"
        />
        <Stat
          label="Streak"
          value={`${curStreak}d`}
          sub="current run"
          accent="bg-orange-50 border-orange-100"
          icon="🔥"
        />
        <Stat
          label="Best"
          value={`${bestStreak}d`}
          sub="personal best"
          accent="bg-pink-50 border-pink-100"
          icon="⭐"
        />
      </div>
    </div>
  );
}
