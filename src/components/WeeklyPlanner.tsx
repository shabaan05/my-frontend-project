import { useState, useRef, useEffect } from 'react';
import type { PlannerItem } from '../data/types';
import { getWeeklyStats } from '../utils/dateUtils';
import type { AppData } from '../data/types';

interface Props {
  data: AppData;
  onAdd:    (weekNum: number, title: string, category: string) => void;
  onUpdate: (itemId: string, changes: Partial<Pick<PlannerItem, 'title' | 'completed' | 'category'>>) => void;
  onDelete: (itemId: string) => void;
  onToggle: (itemId: string) => void;
}

const WEEK_ACCENTS = [
  { header: 'bg-blue-50   border-blue-100',  dot: 'bg-blue-400',    badge: 'bg-blue-100   text-blue-600',   btn: 'bg-blue-500   hover:bg-blue-600'   },
  { header: 'bg-violet-50 border-violet-100',dot: 'bg-violet-400',  badge: 'bg-violet-100 text-violet-600', btn: 'bg-violet-500 hover:bg-violet-600' },
  { header: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-600', btn: 'bg-emerald-500 hover:bg-emerald-600' },
  { header: 'bg-pink-50   border-pink-100',  dot: 'bg-pink-400',    badge: 'bg-pink-100   text-pink-600',   btn: 'bg-pink-500   hover:bg-pink-600'   },
];

// ── Inline add form ───────────────────────────────────────────────────────────
function AddItemForm({
  weekNum, accent, onAdd, onClose,
}: { weekNum: number; accent: typeof WEEK_ACCENTS[0]; onAdd: (t: string, c: string) => void; onClose: () => void }) {
  const [title, setTitle]    = useState('');
  const [category, setCat]   = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), category.trim());
    setTitle(''); setCat('');
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 mt-2 p-3 bg-white rounded-xl border border-slate-200">
      <input
        ref={ref}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        placeholder={`Week ${weekNum} goal…`}
        aria-label="New planner item title"
        className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-violet-200"
      />
      <input
        value={category}
        onChange={(e) => setCat(e.target.value)}
        placeholder="Category (optional)"
        aria-label="Category"
        className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-violet-200"
      />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1 rounded-lg">Cancel</button>
        <button type="submit" disabled={!title.trim()} className={`text-xs font-semibold text-white px-4 py-1.5 rounded-lg disabled:opacity-40 transition-colors ${accent.btn}`}>Add</button>
      </div>
    </form>
  );
}

// ── Inline edit row ───────────────────────────────────────────────────────────
function EditRow({
  item, onSave, onCancel,
}: { item: PlannerItem; onSave: (t: string, c: string) => void; onCancel: () => void }) {
  const [title, setTitle]  = useState(item.title);
  const [cat, setCat]      = useState(item.category);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

  function commit() {
    if (!title.trim()) return;
    onSave(title.trim(), cat.trim());
  }

  return (
    <div className="flex flex-col gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
      <input ref={ref} value={title} onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onCancel(); }}
        className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-violet-200" />
      <input value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Category"
        className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-violet-200" />
      <div className="flex gap-1.5 justify-end">
        <button onClick={onCancel} className="text-[11px] text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded">Cancel</button>
        <button onClick={commit} className="text-[11px] font-semibold bg-violet-500 text-white px-3 py-0.5 rounded transition-colors hover:bg-violet-600">Save</button>
      </div>
    </div>
  );
}

// ── Week Section ──────────────────────────────────────────────────────────────
function WeekSection({
  weekNum, items, weekLabel, accent,
  onAdd, onUpdate, onDelete, onToggle,
}: {
  weekNum: number;
  items: PlannerItem[];
  weekLabel: string;
  accent: typeof WEEK_ACCENTS[0];
  onAdd: (t: string, c: string) => void;
  onUpdate: (id: string, changes: Partial<Pick<PlannerItem, 'title' | 'completed' | 'category'>>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [showAdd, setShowAdd]   = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const done  = items.filter((i) => i.completed).length;
  const total = items.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className={`rounded-2xl border overflow-hidden ${accent.header}`}>
      {/* Week header */}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
          <span className="text-sm font-bold text-slate-800">Week {weekNum}</span>
          <span className="text-[10px] text-slate-400">{weekLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${accent.badge}`}>
              {pct}% · {done}/{total}
            </span>
          )}
          {/* Progress bar */}
          {total > 0 && (
            <div className="w-16 h-1.5 bg-white/60 rounded-full overflow-hidden hidden sm:block">
              <div
                className={`h-full rounded-full transition-all motion-reduce:transition-none ${accent.btn.split(' ')[0]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
          <button
            onClick={() => { setShowAdd((v) => !v); setEditId(null); }}
            aria-label={`Add item to week ${weekNum}`}
            className={`w-6 h-6 flex items-center justify-center rounded-lg text-white text-sm transition-colors ${accent.btn}`}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-white px-4 pb-3">
        {showAdd && (
          <AddItemForm
            weekNum={weekNum}
            accent={accent}
            onAdd={(t, c) => { onAdd(t, c); setShowAdd(false); }}
            onClose={() => setShowAdd(false)}
          />
        )}

        {items.length === 0 && !showAdd ? (
          <p className="text-xs text-slate-400 py-3 text-center">Nothing planned — add a goal above.</p>
        ) : (
          <ul className="space-y-1.5 pt-2">
            {items.map((item) =>
              editId === item.id ? (
                <li key={item.id}>
                  <EditRow
                    item={item}
                    onSave={(t, c) => { onUpdate(item.id, { title: t, category: c }); setEditId(null); }}
                    onCancel={() => setEditId(null)}
                  />
                </li>
              ) : confirmId === item.id ? (
                /* Confirm delete */
                <li key={item.id} className="flex items-center gap-2 px-2 py-1.5 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-xs text-rose-600 flex-1">Delete "{item.title}"?</span>
                  <button onClick={() => { onDelete(item.id); setConfirmId(null); }}
                    className="text-[11px] font-semibold bg-rose-500 text-white px-2.5 py-0.5 rounded-lg hover:bg-rose-600 transition-colors">Yes</button>
                  <button onClick={() => setConfirmId(null)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded-lg">Cancel</button>
                </li>
              ) : (
                <li key={item.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-xl group transition-colors ${
                    item.completed ? 'bg-slate-50' : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => onToggle(item.id)}
                    aria-label={item.completed ? `Mark "${item.title}" incomplete` : `Complete "${item.title}"`}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.completed ? `${accent.btn.split(' ')[0]} border-transparent` : 'border-slate-300 hover:border-violet-400'
                    }`}
                  >
                    {item.completed && (
                      <svg width="8" height="8" viewBox="0 0 16 16" fill="white" aria-hidden>
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                      </svg>
                    )}
                  </button>

                  <span className={`flex-1 text-xs leading-snug ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {item.title}
                    {item.category && (
                      <span className="ml-1.5 text-[10px] text-slate-400 bg-slate-100 rounded px-1 py-0.5">{item.category}</span>
                    )}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => { setEditId(item.id); setShowAdd(false); }}
                      aria-label={`Edit "${item.title}"`}
                      className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-violet-500 rounded transition-colors">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                        <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.34 11.22a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.25.25 0 00.108-.064L11.19 6.25z"/>
                      </svg>
                    </button>
                    <button onClick={() => setConfirmId(item.id)}
                      aria-label={`Delete "${item.title}"`}
                      className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-rose-500 rounded transition-colors">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                        <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 00.249.225h5.19a.25.25 0 00.249-.225l.66-6.6a.75.75 0 011.492.149l-.66 6.6A1.748 1.748 0 0110.595 15H5.405a1.748 1.748 0 01-1.741-1.575l-.66-6.6a.75.75 0 111.492-.15z"/>
                      </svg>
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WeeklyPlanner({ data, onAdd, onUpdate, onDelete, onToggle }: Props) {
  const weeklyStats = getWeeklyStats(data);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <h2 className="text-base font-bold text-slate-800">Weekly Planner</h2>
          <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
            {data.plannerItems.length} item{data.plannerItems.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 ml-4">Plan goals for each week of your 30-day period</p>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((wn, i) => {
          const ws    = weeklyStats[i];
          const items = data.plannerItems.filter((p) => p.weekNum === wn);
          const first = ws?.days[0];
          const last  = ws?.days[ws.days.length - 1];
          const weekLabel = first && last
            ? `${first.dayName} ${first.dayNum} – ${last.dayName} ${last.dayNum}`
            : `Week ${wn}`;

          return (
            <WeekSection
              key={wn}
              weekNum={wn}
              items={items}
              weekLabel={weekLabel}
              accent={WEEK_ACCENTS[i]}
              onAdd={(t, c) => onAdd(wn, t, c)}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          );
        })}
      </div>
    </div>
  );
}
