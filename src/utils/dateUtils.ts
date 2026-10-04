import type { AppData } from '../data/types';

/**
 * Returns the date key for a given Date object as "YYYY-MM-DD"
 * using LOCAL calendar date (not UTC) so timezone shifts don't move the day.
 */
export function getDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns an array of the last 30 calendar date keys (inclusive of today),
 * oldest first.
 */
export function getLast30Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(getDateKey(d));
  }
  return days;
}

/**
 * Returns the label for a date key (e.g. "Mon 14").
 */
export function getDayLabel(dateKey: string): { dayNum: number; dayName: string } {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    dayNum: d,
    dayName: dayNames[date.getDay()],
  };
}

/**
 * Calculates what % of habits were completed on a given day.
 * Returns 0 if there are no habits.
 */
export function calculateDailyPercentage(
  data: AppData,
  dateKey: string
): number {
  const activeHabits = data.habits.filter((h) => !h.archived);
  if (activeHabits.length === 0) return 0;
  const record = data.dailyRecords[dateKey];
  if (!record) return 0;
  const completed = record.completedHabitIds.filter((id) =>
    activeHabits.some((h) => h.id === id)
  ).length;
  return Math.round((completed / activeHabits.length) * 100);
}

/**
 * A day is "successful" if its completion % >= the streak threshold.
 * Future days are never successful.
 */
function isDaySuccessful(data: AppData, dateKey: string, todayKey: string): boolean {
  if (dateKey > todayKey) return false;
  const pct = calculateDailyPercentage(data, dateKey);
  return pct >= data.settings.streakThreshold;
}

/**
 * Current streak: consecutive successful days going backwards from the most
 * recent applicable day (today or yesterday if today has no data yet).
 */
export function calculateCurrentStreak(data: AppData): number {
  const todayKey = getDateKey();
  const days = getLast30Days();
  // Reverse to go from most recent to oldest
  const reversed = [...days].reverse();

  let streak = 0;
  for (const day of reversed) {
    if (day > todayKey) continue; // skip future (shouldn't happen but guard)
    if (isDaySuccessful(data, day, todayKey)) {
      streak++;
    } else {
      // If today isn't successful yet don't break; check if it has any data
      // (user might not have logged today at all — treat as "not broken yet")
      if (day === todayKey) {
        // Today exists but not successful — streak not broken, just continue
        continue;
      }
      break;
    }
  }
  return streak;
}

/**
 * Best streak: longest run of consecutive successful days in the 30-day window.
 */
export function calculateBestStreak(data: AppData): number {
  const todayKey = getDateKey();
  const days = getLast30Days();
  let best = 0;
  let current = 0;
  for (const day of days) {
    if (isDaySuccessful(data, day, todayKey)) {
      current++;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

/**
 * Overall 30-day average: mean of daily percentages for past+today days only.
 */
export function calculateOverallPercentage(data: AppData): number {
  const todayKey = getDateKey();
  const days = getLast30Days().filter((d) => d <= todayKey);
  if (days.length === 0) return 0;
  const total = days.reduce((sum, d) => sum + calculateDailyPercentage(data, d), 0);
  return Math.round(total / days.length);
}

// ─── Analytics Selectors ──────────────────────────────────────────────────────

export interface DayStat {
  dateKey: string;       // "YYYY-MM-DD"
  dayNum: number;        // calendar day number
  dayName: string;       // "Mon", "Tue", etc.
  pct: number;           // 0-100 completion %
  completed: number;     // count of completed habits
  total: number;         // count of active habits
  isToday: boolean;
  isFuture: boolean;
  isSuccessful: boolean; // pct >= streakThreshold
  completedHabitIds: string[];
}

export interface WeekStat {
  weekNum: number;       // 1-4
  days: DayStat[];
  avgPct: number;        // mean of past/today days only
  completedCount: number; // total completed habit-days
  successfulDays: number;
  missedDays: number;    // past days with pct < threshold
}

export interface MonthStat {
  days: DayStat[];
  overallAvg: number;
  perfectDays: number;   // pct === 100
  successfulDays: number;
  lowDays: number;       // pct > 0 && pct < 40
  zeroDays: number;      // past days with pct === 0
}

/**
 * Returns a DayStat for every day in the 30-day window.
 * This is the single source of truth all charts read from.
 */
export function getDailyStats(data: AppData): DayStat[] {
  const todayKey = getDateKey();
  const days = getLast30Days();
  const activeHabits = data.habits.filter((h) => !h.archived);
  const total = activeHabits.length;

  return days.map((dateKey) => {
    const { dayNum, dayName } = getDayLabel(dateKey);
    const isToday = dateKey === todayKey;
    const isFuture = dateKey > todayKey;

    let completed = 0;
    let completedHabitIds: string[] = [];

    if (!isFuture && total > 0) {
      const record = data.dailyRecords[dateKey];
      if (record) {
        completedHabitIds = record.completedHabitIds.filter((id) =>
          activeHabits.some((h) => h.id === id)
        );
        completed = completedHabitIds.length;
      }
    }

    const pct = total > 0 && !isFuture
      ? Math.round((completed / total) * 100)
      : 0;

    const isSuccessful = !isFuture && pct >= data.settings.streakThreshold;

    return {
      dateKey,
      dayNum,
      dayName,
      pct,
      completed,
      total,
      isToday,
      isFuture,
      isSuccessful,
      completedHabitIds,
    };
  });
}

/**
 * Splits the 30-day stats into 4 weekly groups (7 days each, oldest first).
 */
export function getWeeklyStats(data: AppData): WeekStat[] {
  const allDays = getDailyStats(data);
  const weeks: WeekStat[] = [];

  for (let w = 0; w < 4; w++) {
    const slice = allDays.slice(w * 7, w * 7 + 7);
    const pastDays = slice.filter((d) => !d.isFuture);
    const successfulDays = pastDays.filter((d) => d.isSuccessful).length;
    const missedDays = pastDays.filter((d) => !d.isSuccessful).length;
    const completedCount = pastDays.reduce((s, d) => s + d.completed, 0);
    const avgPct =
      pastDays.length > 0
        ? Math.round(
            pastDays.reduce((s, d) => s + d.pct, 0) / pastDays.length
          )
        : 0;

    weeks.push({
      weekNum: w + 1,
      days: slice,
      avgPct,
      completedCount,
      successfulDays,
      missedDays,
    });
  }

  return weeks;
}

/**
 * Returns aggregate stats for the full 30-day window.
 */
export function getMonthlyStats(data: AppData): MonthStat {
  const allDays = getDailyStats(data);
  const pastDays = allDays.filter((d) => !d.isFuture);

  const overallAvg =
    pastDays.length > 0
      ? Math.round(
          pastDays.reduce((s, d) => s + d.pct, 0) / pastDays.length
        )
      : 0;

  const perfectDays = pastDays.filter((d) => d.pct === 100).length;
  const successfulDays = pastDays.filter((d) => d.isSuccessful).length;
  const lowDays = pastDays.filter((d) => d.pct > 0 && d.pct < 40).length;
  const zeroDays = pastDays.filter((d) => d.pct === 0).length;

  return { days: allDays, overallAvg, perfectDays, successfulDays, lowDays, zeroDays };
}

// ─── Navigation Window ────────────────────────────────────────────────────────

/**
 * Returns 30 date keys for a window that ends at (today + offsetDays).
 * offsetDays=0  → current 30 days (default)
 * offsetDays=-30 → previous 30 days
 * offsetDays=+30 → next 30 days (capped so window never extends past today+1)
 *
 * We NEVER allow a window that starts in the future relative to today,
 * but we DO allow viewing the current period.
 */
export function getDaysInWindow(offsetDays: number = 0): string[] {
  const today = new Date();
  const windowEnd = new Date(today);
  windowEnd.setDate(today.getDate() + offsetDays);

  // Cap forward: don't allow window end beyond today
  const cap = new Date(today);
  if (windowEnd > cap) windowEnd.setTime(cap.getTime());

  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(windowEnd);
    d.setDate(windowEnd.getDate() - i);
    days.push(getDateKey(d));
  }
  return days;
}

/**
 * Returns a human-readable label for a 30-day window.
 * e.g. "Sep 16 – Oct 15"
 */
export function getWindowLabel(days: string[]): string {
  if (days.length === 0) return '';
  const first = days[0];
  const last  = days[days.length - 1];
  const fmt = (dk: string) => {
    const [y, m, d] = dk.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  return `${fmt(first)} – ${fmt(last)}`;
}

/**
 * Given a full AppData + an arbitrary 30-day window, compute DayStats.
 * Re-uses the same logic as getDailyStats but for any window.
 */
export function getDailyStatsForWindow(data: AppData, days: string[]): DayStat[] {
  const todayKey = getDateKey();
  const activeHabits = data.habits.filter((h) => !h.archived);
  const total = activeHabits.length;

  return days.map((dateKey) => {
    const { dayNum, dayName } = getDayLabel(dateKey);
    const isToday  = dateKey === todayKey;
    const isFuture = dateKey > todayKey;

    let completed = 0;
    let completedHabitIds: string[] = [];

    if (!isFuture && total > 0) {
      const record = data.dailyRecords[dateKey];
      if (record) {
        completedHabitIds = record.completedHabitIds.filter((id) =>
          activeHabits.some((h) => h.id === id)
        );
        completed = completedHabitIds.length;
      }
    }

    const pct = total > 0 && !isFuture
      ? Math.round((completed / total) * 100)
      : 0;

    const isSuccessful = !isFuture && pct >= data.settings.streakThreshold;

    return { dateKey, dayNum, dayName, pct, completed, total, isToday, isFuture, isSuccessful, completedHabitIds };
  });
}

/**
 * Find the most recent past day (excluding today) that broke the streak.
 * Returns null if no break found in the 30-day window.
 */
export function findLastStreakBreak(data: AppData): string | null {
  const todayKey = getDateKey();
  const days = getLast30Days().filter((d) => d < todayKey).reverse();
  for (const day of days) {
    const pct = calculateDailyPercentage(data, day);
    if (pct < data.settings.streakThreshold) return day;
  }
  return null;
}

/**
 * Get the current week's average % (the week that contains today).
 */
export function getCurrentWeekAvg(data: AppData): number {
  const weekly = getWeeklyStats(data);
  const todayKey = getDateKey();
  const allDays = getDailyStats(data);
  const todayIndex = allDays.findIndex((d) => d.dateKey === todayKey);
  const weekIndex = todayIndex >= 0 ? Math.floor(todayIndex / 7) : 3;
  return weekly[weekIndex]?.avgPct ?? 0;
}
