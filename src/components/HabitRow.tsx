import { useState, useRef, useEffect } from 'react';
import type { Habit } from '../data/types';
import { getDateKey } from '../utils/dateUtils';

interface Props {
  habit: Habit;
  days: string[];
  isHabitDoneOnDay: (habitId: string, dateKey: string) => boolean;
  onToggle: (habitId: string, dateKey: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export default function HabitRow({ habit, days, isHabitDoneOnDay, onToggle, onDelete, onRename }: Props) {
  const todayKey = getDateKey();
  const [editing, setEditing]     = useState(false);
  const [draftName, setDraftName] = useState(habit.name);
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft when habit name changes externally
  useEffect(() => { setDraftName(habit.name); }, [habit.name]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commitRename() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== habit.name) onRename(habit.id, trimmed);
    else setDraftName(habit.name);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setDraftName(habit.name); setEditing(false); }
  }

  return (
    <div className="flex items-center group">
      {/* Habit name cell */}
      <div className="flex items-center gap-1.5 w-40 shrink-0 pr-3">
        {editing ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
            aria-label={`Rename habit: ${habit.name}`}
            className="w-full text-sm font-medium text-slate-700 bg-white border border-violet-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-violet-200"
          />
        ) : confirming ? (
          /* Confirm delete inline */
          <div className="flex items-center gap-1 w-full">
            <span className="text-[10px] text-rose-600 truncate flex-1">Delete?</span>
            <button
              onClick={() => onDelete(habit.id)}
              aria-label={`Confirm delete ${habit.name}`}
              className="text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded hover:bg-rose-600 transition-colors"
            >Yes</button>
            <button
              onClick={() => setConfirming(false)}
              aria-label="Cancel delete"
              className="text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded"
            >No</button>
          </div>
        ) : (
          <>
            <span
              className="text-sm font-medium text-slate-700 truncate cursor-pointer hover:text-violet-600 transition-colors flex-1 min-w-0"
              title={`Double-click to rename: ${habit.name}`}
              onDoubleClick={() => setEditing(true)}
            >
              {habit.name}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => setEditing(true)}
                aria-label={`Rename ${habit.name}`}
                title="Rename"
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-violet-500 rounded transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.34 11.22a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.25.25 0 00.108-.064L11.19 6.25z" />
                </svg>
              </button>
              <button
                onClick={() => setConfirming(true)}
                aria-label={`Delete ${habit.name}`}
                title="Delete"
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-rose-500 rounded transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 00.249.225h5.19a.25.25 0 00.249-.225l.66-6.6a.75.75 0 011.492.149l-.66 6.6A1.748 1.748 0 0110.595 15H5.405a1.748 1.748 0 01-1.741-1.575l-.66-6.6a.75.75 0 111.492-.15z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Day checkboxes */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {days.map((dateKey) => {
          const isFuture = dateKey > todayKey;
          const isToday  = dateKey === todayKey;
          const done     = isHabitDoneOnDay(habit.id, dateKey);

          return (
            <button
              key={dateKey}
              disabled={isFuture}
              onClick={() => onToggle(habit.id, dateKey)}
              aria-label={
                isFuture ? `Future day ${dateKey}` :
                done ? `Uncheck ${habit.name} on ${dateKey}` : `Check ${habit.name} on ${dateKey}`
              }
              aria-pressed={done}
              className={[
                'w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0 transition-all border',
                isFuture
                  ? 'border-slate-100 bg-slate-50 cursor-not-allowed'
                  : done
                  ? isToday
                    ? 'bg-violet-500 border-violet-500 text-white'
                    : 'bg-blue-400 border-blue-400 text-white'
                  : isToday
                  ? 'border-violet-300 bg-violet-50 hover:bg-violet-100 cursor-pointer'
                  : 'border-slate-200 bg-white hover:bg-slate-50 cursor-pointer',
              ].join(' ')}
            >
              {done ? (
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                </svg>
              ) : isFuture ? (
                <span className="text-slate-200" aria-hidden>·</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
