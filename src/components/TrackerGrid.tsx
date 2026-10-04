import type { AppData, Habit } from '../data/types';
import { getLast30Days, calculateDailyPercentage, getDateKey } from '../utils/dateUtils';
import DayHeader from './DayHeader';
import HabitRow from './HabitRow';
import AddHabitForm from './AddHabitForm';

interface Props {
  data: AppData;
  habits: Habit[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onToggle: (habitId: string, dateKey: string) => void;
  isHabitDoneOnDay: (habitId: string, dateKey: string) => boolean;
}

export default function TrackerGrid({
  data,
  habits,
  onAdd,
  onDelete,
  onRename,
  onToggle,
  isHabitDoneOnDay,
}: Props) {
  const days = getLast30Days();
  const todayKey = getDateKey();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">
            30-Day Tracker
          </h2>
          <span className="text-xs text-slate-400 bg-slate-50 rounded-full px-2.5 py-1 border border-slate-100">
            {habits.length} habit{habits.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Double-click a habit name to rename · Hover for more actions
        </p>
      </div>

      {/* Scrollable grid */}
      <div className="px-5 py-4 overflow-x-auto">
        <div className="min-w-max">
          {/* Day column headers */}
          <DayHeader days={days} data={data} />

          {/* Habit rows */}
          <div className="flex flex-col gap-2 mt-2">
            {habits.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No habits yet. Add one below!
              </div>
            ) : (
              habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  days={days}
                  isHabitDoneOnDay={isHabitDoneOnDay}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onRename={onRename}
                />
              ))
            )}
          </div>

          {/* Daily % row */}
          {habits.length > 0 && (
            <div className="flex items-center mt-3 pt-3 border-t border-slate-100">
              <div className="w-40 shrink-0 pr-3">
                <span className="text-xs text-slate-400 font-medium">Daily %</span>
              </div>
              <div className="flex items-center gap-1">
                {days.map((dateKey) => {
                  const isFuture = dateKey > todayKey;
                  const isToday = dateKey === todayKey;
                  const pct = isFuture ? null : calculateDailyPercentage(data, dateKey);

                  let textColor = 'text-slate-300';
                  if (!isFuture && pct !== null) {
                    if (pct >= 80) textColor = 'text-emerald-500';
                    else if (pct >= 50) textColor = 'text-blue-400';
                    else if (pct > 0) textColor = 'text-amber-500';
                    else textColor = 'text-slate-300';
                  }

                  return (
                    <div
                      key={dateKey}
                      className={`w-7 shrink-0 text-center text-[9px] font-semibold leading-none ${textColor} ${
                        isToday ? 'font-bold' : ''
                      }`}
                      title={pct !== null ? `${dateKey}: ${pct}%` : dateKey}
                    >
                      {!isFuture && pct !== null ? `${pct}` : '·'}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add habit */}
      <div className="px-5 pb-5">
        <AddHabitForm onAdd={onAdd} />
      </div>
    </div>
  );
}
