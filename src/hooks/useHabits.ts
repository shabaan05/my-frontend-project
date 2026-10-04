import { useState, useCallback } from 'react';
import type { AppData, Habit, Task, TaskPriority, Note, NoteColor, PlannerItem } from '../data/types';
import { loadData, saveData } from '../utils/storage';
import { getDateKey } from '../utils/dateUtils';

export function useHabits() {
  const [data, setData] = useState<AppData>(() => loadData());

  const update = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  // ─── Habit CRUD ──────────────────────────────────────────────────────────

  const addHabit = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: trimmed,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    update((prev) => ({ ...prev, habits: [...prev.habits, newHabit] }));
  }, [update]);

  const deleteHabit = useCallback((id: string) => {
    update((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
      dailyRecords: Object.fromEntries(
        Object.entries(prev.dailyRecords).map(([dk, record]) => [
          dk,
          { ...record, completedHabitIds: record.completedHabitIds.filter((hid) => hid !== id) },
        ])
      ),
    }));
  }, [update]);

  const renameHabit = useCallback((id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    update((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => h.id === id ? { ...h, name: trimmed } : h),
    }));
  }, [update]);

  // ─── Daily record toggling ────────────────────────────────────────────────

  const toggleHabitDay = useCallback((habitId: string, dateKey: string) => {
    const todayKey = getDateKey();
    if (dateKey > todayKey) return;
    update((prev) => {
      const existing = prev.dailyRecords[dateKey] ?? { completedHabitIds: [] };
      const alreadyDone = existing.completedHabitIds.includes(habitId);
      const updated = alreadyDone
        ? existing.completedHabitIds.filter((id) => id !== habitId)
        : [...existing.completedHabitIds, habitId];
      return {
        ...prev,
        dailyRecords: { ...prev.dailyRecords, [dateKey]: { completedHabitIds: updated } },
      };
    });
  }, [update]);

  const isHabitDoneOnDay = useCallback((habitId: string, dateKey: string): boolean => {
    const record = data.dailyRecords[dateKey];
    return record ? record.completedHabitIds.includes(habitId) : false;
  }, [data.dailyRecords]);

  // ─── Task CRUD (date-scoped) ──────────────────────────────────────────────

  const addTask = useCallback((dateKey: string, title: string, category = '', priority: TaskPriority = 'medium') => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: trimmed,
      completed: false,
      category: category.trim(),
      priority,
      createdAt: new Date().toISOString(),
    };
    update((prev) => ({
      ...prev,
      tasks: { ...prev.tasks, [dateKey]: [...(prev.tasks[dateKey] ?? []), task] },
    }));
  }, [update]);

  const updateTask = useCallback((
    dateKey: string,
    taskId: string,
    changes: Partial<Pick<Task, 'title' | 'completed' | 'category' | 'priority'>>
  ) => {
    update((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [dateKey]: (prev.tasks[dateKey] ?? []).map((t) => t.id === taskId ? { ...t, ...changes } : t),
      },
    }));
  }, [update]);

  const deleteTask = useCallback((dateKey: string, taskId: string) => {
    update((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [dateKey]: (prev.tasks[dateKey] ?? []).filter((t) => t.id !== taskId),
      },
    }));
  }, [update]);

  const toggleTask = useCallback((dateKey: string, taskId: string) => {
    update((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [dateKey]: (prev.tasks[dateKey] ?? []).map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      },
    }));
  }, [update]);

  const getTasksForDate = useCallback((dateKey: string): Task[] => {
    return data.tasks[dateKey] ?? [];
  }, [data.tasks]);

  // ─── Notes CRUD ───────────────────────────────────────────────────────────

  const addNote = useCallback((title: string, content: string, color: NoteColor = 'lavender') => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) return;
    const now = new Date().toISOString();
    const note: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: trimmedTitle,
      content: trimmedContent,
      color,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    update((prev) => ({ ...prev, notes: [note, ...prev.notes] }));
  }, [update]);

  const updateNote = useCallback((
    noteId: string,
    changes: Partial<Pick<Note, 'title' | 'content' | 'color' | 'pinned'>>
  ) => {
    update((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === noteId ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n
      ),
    }));
  }, [update]);

  const deleteNote = useCallback((noteId: string) => {
    update((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== noteId) }));
  }, [update]);

  const toggleNotePin = useCallback((noteId: string) => {
    update((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === noteId ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n
      ),
    }));
  }, [update]);

  // ─── Planner CRUD (week-scoped) ───────────────────────────────────────────

  const addPlannerItem = useCallback((weekNum: number, title: string, category = '') => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const item: PlannerItem = {
      id: `planner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      weekNum,
      title: trimmed,
      completed: false,
      category: category.trim(),
      createdAt: new Date().toISOString(),
    };
    update((prev) => ({ ...prev, plannerItems: [...prev.plannerItems, item] }));
  }, [update]);

  const updatePlannerItem = useCallback((
    itemId: string,
    changes: Partial<Pick<PlannerItem, 'title' | 'completed' | 'category'>>
  ) => {
    update((prev) => ({
      ...prev,
      plannerItems: prev.plannerItems.map((p) => p.id === itemId ? { ...p, ...changes } : p),
    }));
  }, [update]);

  const deletePlannerItem = useCallback((itemId: string) => {
    update((prev) => ({
      ...prev,
      plannerItems: prev.plannerItems.filter((p) => p.id !== itemId),
    }));
  }, [update]);

  const togglePlannerItem = useCallback((itemId: string) => {
    update((prev) => ({
      ...prev,
      plannerItems: prev.plannerItems.map((p) =>
        p.id === itemId ? { ...p, completed: !p.completed } : p
      ),
    }));
  }, [update]);

  return {
    data,
    habits: data.habits.filter((h) => !h.archived),
    addHabit, deleteHabit, renameHabit, toggleHabitDay, isHabitDoneOnDay,
    addTask, updateTask, deleteTask, toggleTask, getTasksForDate,
    addNote, updateNote, deleteNote, toggleNotePin,
    addPlannerItem, updatePlannerItem, deletePlannerItem, togglePlannerItem,
  };
}
