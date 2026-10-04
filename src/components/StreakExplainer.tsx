import type { AppData } from '../data/types';
import {
  calculateCurrentStreak,
  calculateBestStreak,
  findLastStreakBreak,
  calculateDailyPercentage,
  getDateKey,
} from '../utils/dateUtils';

interface Props {
  data: AppData;
}

function fmtDate(dk: string): string {
  const [y, m, d] = dk.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export default function StreakExplainer({ data }: Props) {
  const todayKey      = getDateKey();
  const curStreak     = calculateCurrentStreak(data);
  const bestStreak    = calculateBestStreak(data);
  const threshold     = data.settings.streakThreshold;
  const todayPct      = calculateDailyPercentage(data, todayKey);
  const lastBreak     = findLastStreakBreak(data);
  const isStreakAlive = curStreak > 0;

  // Is today already successful?
  const todaySuccessful = todayPct >= threshold;

  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${
      isStreakAlive
        ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-100'
        : 'bg-gradient-to-br from-slate-50 to-rose-50 border-rose-100'
    }`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label={isStreakAlive ? 'Fire' : 'Broken streak'}>
            {isStreakAlive ? '🔥' : '💔'}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">
              {curStreak > 0 ? `${curStreak}-day streak` : 'No active streak'}
            </p>
            <p className="text-[10px] text-slate-400">Best: {bestStreak} day{bestStreak !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
          isStreakAlive ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-600'
        }`}>
          {isStreakAlive ? 'Active' : 'Broken'}
        </div>
      </div>

      {/* Explanation */}
      <div className={`rounded-xl p-3 text-xs leading-relaxed ${
        isStreakAlive ? 'bg-white/60 text-slate-600' : 'bg-white/60 text-slate-600'
      }`}>
        {isStreakAlive ? (
          <p>
            Your streak is maintained because you completed at least{' '}
            <strong>{threshold}%</strong> of your habits on each of the last{' '}
            <strong>{curStreak}</strong> day{curStreak !== 1 ? 's' : ''}.
            {!todaySuccessful && (
              <span className="block mt-1 text-amber-600 font-medium">
                ⚡ Today is at {todayPct}% — reach {threshold}% to keep it going.
              </span>
            )}
            {todaySuccessful && (
              <span className="block mt-1 text-emerald-600 font-medium">
                ✓ Today's {todayPct}% keeps your streak alive.
              </span>
            )}
          </p>
        ) : (
          <p>
            {lastBreak ? (
              <>
                Your streak was broken on{' '}
                <strong>{fmtDate(lastBreak)}</strong> because completion was below{' '}
                <strong>{threshold}%</strong> (
                {calculateDailyPercentage(data, lastBreak)}% recorded).
                Complete at least {threshold}% of your habits today to start a new streak.
              </>
            ) : (
              <>
                Complete at least <strong>{threshold}%</strong> of your habits on a day to start a streak.
              </>
            )}
          </p>
        )}
      </div>

      {/* Threshold note */}
      <p className="text-[10px] text-slate-400 mt-2">
        Threshold: {threshold}% — a day counts when at least {threshold}% of habits are done.
      </p>
    </div>
  );
}
