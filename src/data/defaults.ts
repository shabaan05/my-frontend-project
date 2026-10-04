import type { AppData } from './types';

export const DEFAULT_HABITS = [
  'Java',
  'DSA',
  'Spring Boot',
  'Job Applications',
  'Exercise',
];

export function createDefaultData(): AppData {
  const now = new Date().toISOString();
  return {
    version: 1,
    settings: {
      streakThreshold: 70,
    },
    habits: DEFAULT_HABITS.map((name, index) => ({
      id: `habit-default-${index}-${Date.now()}`,
      name,
      createdAt: now,
      archived: false,
    })),
    dailyRecords: {},
    tasks: {},
    notes: [],
    plannerItems: [],
  };
}
