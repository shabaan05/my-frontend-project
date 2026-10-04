import type { AppData } from '../data/types';
import { calculateDailyPercentage, getDateKey } from '../utils/dateUtils';

interface Props {
  data: AppData;
  selectedDateKey: string | null;
}

function fmt(dk: string): string {
  const [y, m, d] = dk.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function SelectedDayPanel({ data, selectedDateKey }: Props) {
  if (!selectedDateKey) return null;

  const todayKey    = getDateKey();
  const isFuture    = selectedDateKey > todayKey;
  const isToday     = selectedDateKey === todayKey;

  const activeHabits  = data.habits.filter((h) => !h.archived);
  const record        = data.dailyRecords[selectedDateKey];
  const doneIds       = record
    ? record.completedHabitIds.filter((id) => activeHabits.some((h) => h.id === id))
    : [];
  const habitPct      = calculateDailyPercentage(data, selectedDateKey);
  const completedHabits  = activeHabits.filter((h) => doneIds.includes(h.id));
  const incompleteHabits = activeHabits.filter((h) => !doneIds.includes(h.id));

  const tasks         = data.tasks[selectedDateKey] ?? [];
  const doneTasks     = tasks.filter((t) => t.completed).length;
  const taskPct       = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const threshold     = data.settings.streakThreshold;
  const isSuccessful  = !isFuture && habitPct >= threshold;

  if (isFuture) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <h2 className="text-sm font-bold text-slate-600">Selected Day</h2>
        </div>
        <p className="text-xs text-slate-400">
          <span className="font-medium text-slate-600">{fmt(selectedDateKey)}</span> is in the future.
          No data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border border-violet-100 shadow-sm p-5">
      {/* Title row */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <h2 className="text-sm font-bold text-slate-700">
              {isToday ? 'Today' : 'Selected Day'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 ml-4">{fmt(selectedDateKey)}</p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
          isSuccessful
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-rose-100 text-rose-600'
        }`}>
          {isSuccessful ? '✓ Streak day' : '✗ Below threshold'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Habit % */}
        <div className="bg-white/70 rounded-xl p-3 border border-white/60">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Habits</p>
          <p className="text-2xl font-bold text-slate-800 leading-none">{habitPct}%</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {doneIds.length}/{activeHabits.length} completed
          </p>
        </div>

        {/* Task % */}
        <div className="bg-white/70 rounded-xl p-3 border border-white/60">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Tasks</p>
          <p className="text-2xl font-bold text-slate-800 leading-none">
            {tasks.length > 0 ? `${taskPct}%` : '—'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {tasks.length > 0 ? `${doneTasks}/${tasks.length} done` : 'No tasks'}
          </p>
        </div>
      </div>

      {/* Habit lists */}
      {activeHabits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {completedHabits.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1.5">Completed</p>
              <ul className="space-y-1">
                {completedHabits.map((h) => (
                  <li key={h.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] shrink-0">✓</span>
                    {h.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {incompleteHabits.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wide mb-1.5">Incomplete</p>
              <ul className="space-y-1">
                {incompleteHabits.map((h) => (
                  <li key={h.id} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-rose-50 text-rose-300 flex items-center justify-center text-[9px] shrink-0">✗</span>
                    {h.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tasks list */}
      {tasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-violet-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tasks that day</p>
          <ul className="space-y-1">
            {tasks.map((t) => (
              <li key={t.id} className={`text-xs flex items-center gap-1.5 ${t.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.completed ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                {t.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
