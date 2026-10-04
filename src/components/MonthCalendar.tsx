import { useMemo } from 'react';
import type { AppData } from '../data/types';
import {
  getDaysInWindow,
  getDailyStatsForWindow,
  getWindowLabel,
  getDateKey,
} from '../utils/dateUtils';

interface Props {
  data: AppData;
  selectedDateKey: string | null;
  onSelectDay: (dateKey: string) => void;
  windowOffset: number;           // 0 = current, -30 = prev, -60 = two back, etc.
  onOffsetChange: (offset: number) => void;
}

function pctColor(pct: number, isFuture: boolean): { bg: string; text: string; ring: string } {
  if (isFuture) return { bg: 'bg-slate-50',     text: 'text-slate-300', ring: 'ring-slate-200' };
  if (pct === 0) return { bg: 'bg-slate-100',    text: 'text-slate-400', ring: 'ring-slate-200' };
  if (pct < 40)  return { bg: 'bg-rose-50',      text: 'text-rose-400',  ring: 'ring-rose-300'  };
  if (pct < 70)  return { bg: 'bg-amber-50',     text: 'text-amber-500', ring: 'ring-amber-300' };
  if (pct < 100) return { bg: 'bg-blue-50',      text: 'text-blue-500',  ring: 'ring-blue-300'  };
  return            { bg: 'bg-emerald-50',   text: 'text-emerald-600', ring: 'ring-emerald-400' };
}

export default function MonthCalendar({ data, selectedDateKey, onSelectDay, windowOffset, onOffsetChange }: Props) {
  const todayKey = getDateKey();

  const days     = useMemo(() => getDaysInWindow(windowOffset),            [windowOffset]);
  const stats    = useMemo(() => getDailyStatsForWindow(data, days),       [data, days]);
  const label    = useMemo(() => getWindowLabel(days),                     [days]);

  // Can we go forward? Only if window end < today
  const windowEnd   = days[days.length - 1];
  const canGoNext   = windowEnd < todayKey;
  const canGoPrev   = true; // always allow going back

  // Group into rows of 7
  const rows: typeof stats[number][][] = [];
  for (let i = 0; i < stats.length; i += 7) rows.push(stats.slice(i, i + 7));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <h2 className="text-base font-bold text-slate-800">30-Day Calendar</h2>
        </div>
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOffsetChange(windowOffset - 30)}
            disabled={!canGoPrev}
            aria-label="Previous 30 days"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M9.78 12.78a.75.75 0 01-1.06 0L4.47 8.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L6.06 8l3.72 3.72a.75.75 0 010 1.06z"/></svg>
          </button>
          <span className="text-xs font-medium text-slate-600 px-2 min-w-[130px] text-center">{label}</span>
          <button
            onClick={() => onOffsetChange(Math.min(0, windowOffset + 30))}
            disabled={!canGoNext}
            aria-label="Next 30 days"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/></svg>
          </button>
          {windowOffset !== 0 && (
            <button
              onClick={() => onOffsetChange(0)}
              aria-label="Return to current 30 days"
              className="ml-1 text-[10px] font-semibold text-violet-500 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-lg transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="px-4 pt-3">
        <div className="space-y-1 pb-4">
          {rows.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day) => {
                const colors   = pctColor(day.pct, day.isFuture);
                const isSelected = day.dateKey === selectedDateKey;
                const isToday    = day.isToday;

                return (
                  <button
                    key={day.dateKey}
                    onClick={() => !day.isFuture && onSelectDay(day.dateKey)}
                    disabled={day.isFuture}
                    aria-label={
                      day.isFuture
                        ? `Future: ${day.dateKey}`
                        : `${day.dateKey}: ${day.pct}% completion`
                    }
                    aria-pressed={isSelected}
                    className={[
                      'relative flex flex-col items-center justify-center rounded-xl py-1.5 px-0.5 transition-all motion-reduce:transition-none select-none',
                      day.isFuture ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
                      isSelected
                        ? 'ring-2 ring-violet-500 ring-offset-1 bg-violet-50'
                        : isToday
                        ? `ring-2 ${colors.ring} ring-offset-1 ${colors.bg}`
                        : `${colors.bg} hover:ring-2 ${colors.ring} hover:ring-offset-1`,
                    ].join(' ')}
                  >
                    {/* Day number */}
                    <span className={`text-[11px] font-bold leading-none ${
                      isSelected ? 'text-violet-700' : isToday ? 'text-violet-600' : colors.text
                    }`}>
                      {day.dayNum}
                    </span>

                    {/* Pct label — only past/today */}
                    {!day.isFuture && (
                      <span className={`text-[9px] font-medium mt-0.5 leading-none ${
                        isSelected ? 'text-violet-500' : colors.text
                      }`}>
                        {day.pct > 0 ? `${day.pct}%` : '—'}
                      </span>
                    )}

                    {/* Today dot */}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 flex flex-wrap gap-3">
        {[
          { bg: 'bg-emerald-50', ring: 'ring-emerald-400', label: '100%' },
          { bg: 'bg-blue-50',    ring: 'ring-blue-300',    label: '70–99%' },
          { bg: 'bg-amber-50',   ring: 'ring-amber-300',   label: '40–69%' },
          { bg: 'bg-rose-50',    ring: 'ring-rose-300',    label: '<40%' },
          { bg: 'bg-slate-100',  ring: 'ring-slate-200',   label: 'No data' },
        ].map(({ bg, ring, label: lg }) => (
          <span key={lg} className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className={`w-3 h-3 rounded ${bg} ring-1 ${ring} shrink-0`} />
            {lg}
          </span>
        ))}
      </div>
    </div>
  );
}
