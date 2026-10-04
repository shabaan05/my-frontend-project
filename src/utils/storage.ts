import type { AppData } from '../data/types';
import { createDefaultData } from '../data/defaults';

const STORAGE_KEY = 'habit-tracker-v1';

/**
 * Migrate an older-shaped AppData forward without wiping user data.
 * Called when loading data that is version 1 but may be missing newer fields.
 *
 * Key migrations:
 * - notes was Record<string,unknown> in Step 1/2; must be Note[] from Step 3 onward.
 *   An old save will have notes:{} — Array.isArray catches this and resets to [].
 * - plannerItems did not exist until Step 4; defaults to [].
 */
function migrateData(raw: Partial<AppData>): AppData {
  const defaults = createDefaultData();
  return {
    version: 1,
    settings: raw.settings ?? defaults.settings,
    habits:       Array.isArray(raw.habits)       ? raw.habits       : defaults.habits,
    dailyRecords: (raw.dailyRecords && typeof raw.dailyRecords === 'object' && !Array.isArray(raw.dailyRecords))
                    ? raw.dailyRecords
                    : {},
    tasks:        (raw.tasks && typeof raw.tasks === 'object' && !Array.isArray(raw.tasks))
                    ? raw.tasks
                    : {},
    // notes was Record<string,unknown> in Steps 1-2; any non-array value is reset to []
    notes:        Array.isArray(raw.notes)        ? raw.notes        : [],
    plannerItems: Array.isArray(raw.plannerItems) ? raw.plannerItems : [],
  };
}

/**
 * Load app data from localStorage.
 * Returns default data (with seed habits) only on first run.
 * All subsequent loads return whatever is in storage, migrated forward if needed.
 */
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = createDefaultData();
      saveData(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    // Accept version 1 (including older step-1/2/3 saves) and migrate forward
    if ((parsed.version ?? 0) !== 1) {
      const fresh = createDefaultData();
      saveData(fresh);
      return fresh;
    }
    const migrated = migrateData(parsed);
    // Re-save the migrated form so next load is clean
    saveData(migrated);
    return migrated;
  } catch {
    const fresh = createDefaultData();
    saveData(fresh);
    return fresh;
  }
}

/** Persist the full app data to localStorage. */
export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
  }
}
