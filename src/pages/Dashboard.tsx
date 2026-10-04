import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { getDateKey } from '../utils/dateUtils';

import SummaryBar        from '../components/SummaryBar';
import TrackerGrid       from '../components/TrackerGrid';
import TodayActivities   from '../components/TodayActivities';
import StickyNotes       from '../components/StickyNotes';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import MonthCalendar     from '../components/MonthCalendar';
import SelectedDayPanel  from '../components/SelectedDayPanel';
import QuickStats        from '../components/QuickStats';
import StreakExplainer   from '../components/StreakExplainer';
import WeeklyPlanner     from '../components/WeeklyPlanner';

export default function Dashboard() {
  const {
    data, habits,
    addHabit, deleteHabit, renameHabit, toggleHabitDay, isHabitDoneOnDay,
    addTask, updateTask, deleteTask, toggleTask, getTasksForDate,
    addNote, updateNote, deleteNote, toggleNotePin,
    addPlannerItem, updatePlannerItem, deletePlannerItem, togglePlannerItem,
  } = useHabits();

  // ── Single shared selectedDate ─────────────────────────────────────────────
  const todayKey = getDateKey();
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(todayKey);
  const [calendarOffset, setCalendarOffset]   = useState<number>(0);

  const todayTasks = getTasksForDate(todayKey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20">

      {/* ── Sticky top nav ───────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
              H
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">Habit Tracker</h1>
              <p className="text-xs text-slate-400 leading-tight hidden sm:block">Personal productivity dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
              {habits.length} habit{habits.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Row 1 — Summary stats */}
        <SummaryBar data={data} />

        {/* Row 2 — Quick stats + Streak explainer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuickStats data={data} />
          </div>
          <div>
            <StreakExplainer data={data} />
          </div>
        </div>

        {/* Row 3 — 30-Day Calendar + Selected Day Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MonthCalendar
              data={data}
              selectedDateKey={selectedDateKey}
              onSelectDay={setSelectedDateKey}
              windowOffset={calendarOffset}
              onOffsetChange={setCalendarOffset}
            />
          </div>
          <div>
            <SelectedDayPanel
              data={data}
              selectedDateKey={selectedDateKey}
            />
          </div>
        </div>

        {/* Row 4 — 30-Day Habit Tracker */}
        <TrackerGrid
          data={data}
          habits={habits}
          onAdd={addHabit}
          onDelete={deleteHabit}
          onRename={renameHabit}
          onToggle={toggleHabitDay}
          isHabitDoneOnDay={isHabitDoneOnDay}
        />

        {/* Row 5 — Today's Activities + Sticky Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodayActivities
            tasks={todayTasks}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onUpdate={updateTask}
          />
          <StickyNotes
            notes={data.notes}
            onAdd={addNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
            onPin={toggleNotePin}
          />
        </div>

        {/* Row 6 — Weekly Planner */}
        <WeeklyPlanner
          data={data}
          onAdd={addPlannerItem}
          onUpdate={updatePlannerItem}
          onDelete={deletePlannerItem}
          onToggle={togglePlannerItem}
        />

        {/* Row 7 — Full analytics (charts, heatmap, weekly cards, summary) */}
        {/* selectedDateKey is lifted here so charts + heatmap stay in sync with calendar */}
        <AnalyticsDashboard
          data={data}
          selectedDateKey={selectedDateKey}
          onSelectDay={setSelectedDateKey}
        />

      </main>
    </div>
  );
}
