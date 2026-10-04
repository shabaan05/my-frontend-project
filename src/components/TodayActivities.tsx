import { useState, useRef, useEffect } from 'react';
import type { Task, TaskPriority } from '../data/types';
import { getDateKey } from '../utils/dateUtils';

interface Props {
  tasks: Task[];
  onAdd: (dateKey: string, title: string, category: string, priority: TaskPriority) => void;
  onToggle: (dateKey: string, taskId: string) => void;
  onDelete: (dateKey: string, taskId: string) => void;
  onUpdate: (
    dateKey: string,
    taskId: string,
    changes: Partial<Pick<Task, 'title' | 'completed' | 'category' | 'priority'>>
  ) => void;
}

const PRIORITY_META: Record<TaskPriority, { label: string; dot: string; badge: string }> = {
  high:   { label: 'High',   dot: 'bg-rose-400',   badge: 'bg-rose-50 text-rose-500 border-rose-200' },
  medium: { label: 'Medium', dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-600 border-amber-200' },
  low:    { label: 'Low',    dot: 'bg-slate-300',  badge: 'bg-slate-50 text-slate-400 border-slate-200' },
};

// ── Inline edit row ───────────────────────────────────────────────────────────
interface EditRowProps {
  task: Task;
  dateKey: string;
  onSave: (changes: Partial<Pick<Task, 'title' | 'category' | 'priority'>>) => void;
  onCancel: () => void;
}

function EditRow({ task, onSave, onCancel }: EditRowProps) {
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState(task.category);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function commit() {
    const t = title.trim();
    if (!t) return;
    onSave({ title: t, category: category.trim(), priority });
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-violet-50 rounded-xl border border-violet-200">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onCancel(); }}
        placeholder="Activity title"
        aria-label="Edit activity title"
        className="text-sm text-slate-700 bg-white border border-violet-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-violet-300 w-full"
      />
      <div className="flex gap-2 flex-wrap">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          aria-label="Edit category"
          className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-violet-200 flex-1 min-w-[120px]"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          aria-label="Edit priority"
          className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-violet-200"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={commit}
          disabled={!title.trim()}
          className="text-xs font-semibold bg-violet-500 hover:bg-violet-600 disabled:bg-violet-200 text-white px-4 py-1 rounded-lg transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ── Add form ──────────────────────────────────────────────────────────────────
interface AddFormProps {
  dateKey: string;
  onAdd: (dateKey: string, title: string, category: string, priority: TaskPriority) => void;
  onClose: () => void;
}

function AddForm({ dateKey, onAdd, onClose }: AddFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onAdd(dateKey, t, category, priority);
    setTitle('');
    setCategory('');
    setPriority('medium');
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 p-4 bg-violet-50 rounded-xl border border-violet-200 mt-3">
      <label htmlFor="new-activity-title" className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
        New Activity
      </label>
      <input
        id="new-activity-title"
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        placeholder="What are you working on today?"
        className="text-sm text-slate-700 bg-white border border-violet-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-300 w-full"
        required
      />
      <div className="flex gap-2 flex-wrap">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          aria-label="Category"
          className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-violet-200 flex-1 min-w-[120px]"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          aria-label="Priority"
          className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-violet-200"
        >
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end mt-1">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="text-xs font-semibold bg-violet-500 hover:bg-violet-600 disabled:bg-violet-200 text-white px-5 py-1.5 rounded-lg transition-colors"
        >
          Add Activity
        </button>
      </div>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TodayActivities({ tasks, onAdd, onToggle, onDelete, onUpdate }: Props) {
  const todayKey = getDateKey();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Date heading
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const heading = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

  // Progress
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Sort: incomplete first by priority weight, then completed last
  const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const incomplete = sorted.filter((t) => !t.completed);
  const completedTasks = sorted.filter((t) => t.completed);

  function handleSaveEdit(taskId: string, changes: Partial<Pick<Task, 'title' | 'category' | 'priority'>>) {
    onUpdate(todayKey, taskId, changes);
    setEditingId(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Today's Activities</h2>
            </div>
            <p className="text-xs text-slate-400 ml-4">{heading}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">
              {completed}/{total} done
            </span>
            <button
              onClick={() => { setShowForm((v) => !v); setEditingId(null); }}
              aria-label="Add new activity"
              className="flex items-center gap-1.5 text-xs font-semibold bg-violet-500 hover:bg-violet-600 text-white px-3 py-1.5 rounded-xl transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
              </svg>
              Add
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400">Today's progress</span>
            <span className="text-[11px] font-bold text-violet-600">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-400 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Today's task completion: ${pct}%`}
            />
          </div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-5">
          <AddForm dateKey={todayKey} onAdd={onAdd} onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Task list */}
      <div className="px-5 py-4 space-y-1.5">
        {total === 0 && !showForm && (
          <div className="py-8 text-center">
            <p className="text-2xl mb-2">📝</p>
            <p className="text-sm font-medium text-slate-500">Nothing planned for today.</p>
            <p className="text-xs text-slate-400 mt-1">Add an activity to get started.</p>
          </div>
        )}

        {/* Incomplete tasks */}
        {incomplete.map((task) =>
          editingId === task.id ? (
            <EditRow
              key={task.id}
              task={task}
              dateKey={todayKey}
              onSave={(changes) => handleSaveEdit(task.id, changes)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <TaskRow
              key={task.id}
              task={task}
              todayKey={todayKey}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={() => { setEditingId(task.id); setShowForm(false); }}
            />
          )
        )}

        {/* Divider when both sections have items */}
        {incomplete.length > 0 && completedTasks.length > 0 && (
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wide">Completed</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
        )}

        {/* Completed tasks */}
        {completedTasks.map((task) =>
          editingId === task.id ? (
            <EditRow
              key={task.id}
              task={task}
              dateKey={todayKey}
              onSave={(changes) => handleSaveEdit(task.id, changes)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <TaskRow
              key={task.id}
              task={task}
              todayKey={todayKey}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={() => { setEditingId(task.id); setShowForm(false); }}
            />
          )
        )}
      </div>
    </div>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────
interface TaskRowProps {
  task: Task;
  todayKey: string;
  onToggle: (dateKey: string, taskId: string) => void;
  onDelete: (dateKey: string, taskId: string) => void;
  onEdit: () => void;
}

function TaskRow({ task, todayKey, onToggle, onDelete, onEdit }: TaskRowProps) {
  const meta = PRIORITY_META[task.priority];
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border group transition-colors ${
        task.completed
          ? 'bg-slate-50 border-slate-100'
          : 'bg-white border-slate-100 hover:border-violet-200 hover:bg-violet-50/30'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todayKey, task.id)}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
        aria-pressed={task.completed}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
          task.completed
            ? 'bg-violet-500 border-violet-500'
            : 'border-slate-300 hover:border-violet-400'
        }`}
      >
        {task.completed && (
          <svg width="10" height="10" viewBox="0 0 16 16" fill="white" aria-hidden>
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
            {task.title}
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${meta.badge}`}>
            {meta.label}
          </span>
          {task.category && (
            <span className="text-[10px] text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{task.category}</span>
          )}
        </div>
      </div>

      <div className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} aria-hidden />

      {/* Actions */}
      {confirming ? (
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-rose-600">Delete?</span>
          <button
            onClick={() => onDelete(todayKey, task.id)}
            aria-label="Confirm delete"
            className="text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded hover:bg-rose-600"
          >Yes</button>
          <button
            onClick={() => setConfirming(false)}
            aria-label="Cancel delete"
            className="text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded"
          >No</button>
        </div>
      ) : (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onEdit}
            aria-label={`Edit "${task.title}"`}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-violet-500 rounded-lg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.34 11.22a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.25.25 0 00.108-.064L11.19 6.25z" />
            </svg>
          </button>
          <button
            onClick={() => setConfirming(true)}
            aria-label={`Delete "${task.title}"`}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 00.249.225h5.19a.25.25 0 00.249-.225l.66-6.6a.75.75 0 011.492.149l-.66 6.6A1.748 1.748 0 0110.595 15H5.405a1.748 1.748 0 01-1.741-1.575l-.66-6.6a.75.75 0 111.492-.15z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
