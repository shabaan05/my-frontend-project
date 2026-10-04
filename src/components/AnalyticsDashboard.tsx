import { useState, useMemo } from 'react';
import type { AppData } from '../data/types';
import {
  getDailyStats,
  getWeeklyStats,
  getMonthlyStats,
  getDateKey,
} from '../utils/dateUtils';
import CircularProgress from './CircularProgress';
import DailyBarChart from './DailyBarChart';
import PerformanceLineChart from './PerformanceLineChart';
import WeeklyCards from './WeeklyCards';
import HeatmapCalendar from './HeatmapCalendar';
import PerformanceSummary from './PerformanceSummary';

interface Props {
  data: AppData;
  /** Lifted from Dashboard — single shared selection across all views */
  selectedDateKey: string | null;
  onSelectDay: (dateKey: string) => void;
}

type ChartTab = 'bar' | 'line';

export default function AnalyticsDashboard({ data, selectedDateKey, onSelectDay }: Props) {
  const todayKey = getDateKey();
  const [chartTab, setChartTab] = useState<ChartTab>('bar');

  const dailyStats  = useMemo(() => getDailyStats(data),   [data]);
  const weeklyStats = useMemo(() => getWeeklyStats(data),  [data]);
  const monthlyStats = useMemo(() => getMonthlyStats(data),[data]);

  const todayIndex       = dailyStats.findIndex((d) => d.dateKey === todayKey);
  const currentWeekIndex = todayIndex >= 0 ? Math.floor(todayIndex / 7) : 3;
  const currentWeek      = weeklyStats[currentWeekIndex];
  const todayStat        = dailyStats.find((d) => d.dateKey === todayKey);

  const hasAnyHabits = data.habits.filter((h) => !h.archived).length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Performance Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rolling 30-day view · Updates instantly as you check habits
          </p>
        </div>
      </div>

      {!hasAnyHabits && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm font-semibold text-slate-600">No habits yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Add habits in the tracker above to see analytics here.
          </p>
        </div>
      )}

      {hasAnyHabits && (
        <>
          {/* Circular progress row */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Progress Overview</h3>
            <div className="flex items-center justify-around flex-wrap gap-6">
              <CircularProgress pct={todayStat?.pct ?? 0}       size={96} strokeWidth={9} color="#7c3aed" trackColor="#ede9fe"  label="Today"     />
              <CircularProgress pct={currentWeek?.avgPct ?? 0}  size={96} strokeWidth={9} color="#60a5fa" trackColor="#dbeafe"  label="This Week" />
              <CircularProgress pct={monthlyStats.overallAvg}   size={96} strokeWidth={9} color="#34d399" trackColor="#d1fae5"  label="30-Day Avg"/>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700">Daily Performance</h3>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 text-xs font-medium">
                <button
                  onClick={() => setChartTab('bar')}
                  className={`px-3 py-1.5 transition-colors motion-reduce:transition-none ${chartTab === 'bar' ? 'bg-violet-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >Bar</button>
                <button
                  onClick={() => setChartTab('line')}
                  className={`px-3 py-1.5 transition-colors motion-reduce:transition-none ${chartTab === 'line' ? 'bg-violet-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >Trend</button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Click any bar or point to inspect that day</p>
            {chartTab === 'bar'
              ? <DailyBarChart        days={dailyStats} selectedDateKey={selectedDateKey} onSelectDay={onSelectDay} streakThreshold={data.settings.streakThreshold} />
              : <PerformanceLineChart days={dailyStats} selectedDateKey={selectedDateKey} onSelectDay={onSelectDay} streakThreshold={data.settings.streakThreshold} />
            }
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700">30-Day Heatmap</h3>
              <span className="text-[11px] text-slate-400">Click a day to inspect it</span>
            </div>
            <HeatmapCalendar days={dailyStats} selectedDateKey={selectedDateKey} onSelectDay={onSelectDay} />
          </div>

          {/* Weekly breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Weekly Breakdown</h3>
            <WeeklyCards weeks={weeklyStats} />
          </div>

          {/* Performance summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Performance Summary</h3>
            <PerformanceSummary monthly={monthlyStats} data={data} />
          </div>
        </>
      )}
    </div>
  );
}
