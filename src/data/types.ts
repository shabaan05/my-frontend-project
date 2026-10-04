// Core data model - versioned for future migrations

export interface Habit {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  archived: boolean;
}

export interface DailyRecord {
  completedHabitIds: string[];
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;   // empty string means no category
  priority: TaskPriority;
  createdAt: string;  // ISO date string
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export type NoteColor = 'blue' | 'lavender' | 'yellow' | 'pink' | 'green';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
}

// ─── Weekly Planner ───────────────────────────────────────────────────────────

export interface PlannerItem {
  id: string;
  weekNum: number;    // 1-4, which 7-day slot in the current 30-day window
  title: string;
  completed: boolean;
  category: string;
  createdAt: string;
}

// ─── Root data model ─────────────────────────────────────────────────────────

export interface AppData {
  version: number;
  settings: {
    streakThreshold: number; // % needed to count as a successful day (default 70)
  };
  habits: Habit[];
  dailyRecords: Record<string, DailyRecord>; // key: "YYYY-MM-DD"
  tasks: Record<string, Task[]>;             // key: "YYYY-MM-DD"
  notes: Note[];
  plannerItems: PlannerItem[];               // weekly planner items
}
