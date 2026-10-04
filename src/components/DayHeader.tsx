import { getDayLabel, calculateDailyPercentage, getDateKey } from '../utils/dateUtils';
import type { AppData } from '../data/types';

interface Props {
  days: string[];
  data: AppData;
}

export default function DayHeader({ days, data }: Props) {
  const todayKey = getDateKey();

  return (
    <div className="flex items-end mb-1">
      {/* Spacer matching habit name column */}
      <div className="w-40 shrink-0 pr-3" />

      <div className="flex items-end gap-1 overflow-x-auto scrollbar-none">
        {days.map((dateKey) => {
          const { dayNum, dayName } = getDayLabel(dateKey);
          const isToday = dateKey === todayKey;
          const isFuture = dateKey > todayKey;
          const pct = isFuture ? null : calculateDailyPercentage(data, dateKey);

          // Color band for daily completion
          let bandClass = 'bg-slate-100';
          if (!isFuture && pct !== null) {
            if (pct >= 80) bandClass = 'bg-emerald-400';
            else if (pct >= 50) bandClass = 'bg-blue-300';
            else if (pct > 0) bandClass = 'bg-amber-300';
          }

          return (
            <div
              key={dateKey}
              className={[
                'w-7 shrink-0 flex flex-col items-center gap-0.5',
                isToday ? 'relative' : '',
              ].join(' ')}
            >
              {/* Day name (Mon/Tue etc.) — only show on multiples of 5 or today */}
              <span
                className={[
                  'text-[9px] font-medium leading-none',
                  isToday ? 'text-violet-500 font-bold' : 'text-slate-400',
                ].join(' ')}
              >
                {isToday ? 'today' : dayNum % 5 === 0 ? dayName : ''}
              </span>

              {/* Day number */}
              <span
                className={[
                  'text-[11px] font-semibold leading-none',
                  isToday ? 'text-violet-600' : isFuture ? 'text-slate-300' : 'text-slate-500',
                ].join(' ')}
              >
                {dayNum}
              </span>

              {/* Completion band */}
              <div
                className={[
                  'w-7 h-1 rounded-full',
                  isFuture ? 'bg-slate-100' : bandClass,
                ].join(' ')}
                title={pct !== null ? `${pct}%` : ''}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
