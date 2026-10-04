import { useState } from 'react';

interface Props {
  onAdd: (name: string) => void;
}

export default function AddHabitForm({ onAdd }: Props) {
  const [value, setValue] = useState('');
  const [open, setOpen]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Add new habit"
        className="flex items-center gap-2 text-sm font-medium text-violet-500 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl px-4 py-2.5 transition-colors border border-violet-200 border-dashed w-full mt-2"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
        </svg>
        Add new habit
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <label htmlFor="new-habit-name" className="sr-only">Habit name</label>
      <input
        id="new-habit-name"
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Habit name…"
        className="flex-1 text-sm text-slate-700 bg-white border border-violet-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-violet-200 placeholder:text-slate-300"
        onKeyDown={(e) => { if (e.key === 'Escape') { setValue(''); setOpen(false); } }}
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="text-sm font-semibold bg-violet-500 hover:bg-violet-600 disabled:bg-violet-200 text-white rounded-xl px-4 py-2 transition-colors"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => { setValue(''); setOpen(false); }}
        className="text-sm text-slate-400 hover:text-slate-600 rounded-xl px-3 py-2 transition-colors"
      >
        Cancel
      </button>
    </form>
  );
}
