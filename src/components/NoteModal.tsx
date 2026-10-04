import { useState, useEffect, useRef } from 'react';
import type { Note, NoteColor } from '../data/types';

interface Props {
  /** Pass a Note to edit, undefined to create */
  note?: Note;
  onSave: (title: string, content: string, color: NoteColor) => void;
  onClose: () => void;
}

const COLOR_OPTIONS: { value: NoteColor; label: string; bg: string; ring: string }[] = [
  { value: 'lavender', label: 'Lavender', bg: 'bg-violet-100',  ring: 'ring-violet-400' },
  { value: 'blue',     label: 'Blue',     bg: 'bg-blue-100',    ring: 'ring-blue-400'   },
  { value: 'green',    label: 'Green',    bg: 'bg-emerald-100', ring: 'ring-emerald-400'},
  { value: 'yellow',   label: 'Yellow',   bg: 'bg-yellow-100',  ring: 'ring-yellow-400' },
  { value: 'pink',     label: 'Pink',     bg: 'bg-pink-100',    ring: 'ring-pink-400'   },
];

export default function NoteModal({ note, onSave, onClose }: Props) {
  const [title, setTitle]     = useState(note?.title   ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [color, setColor]     = useState<NoteColor>(note?.color ?? 'lavender');
  const [errors, setErrors]   = useState<{ title?: string; content?: string }>({});

  const titleRef    = useRef<HTMLInputElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const isEditing   = !!note;

  // Focus title on mount
  useEffect(() => { titleRef.current?.focus(); }, []);

  // Trap Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Focus trap — keep tab within modal
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const focusable = overlay!.querySelectorAll<HTMLElement>(
        'input, textarea, button, select, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }
    overlay.addEventListener('keydown', trapFocus);
    return () => overlay.removeEventListener('keydown', trapFocus);
  }, []);

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!title.trim())   errs.title   = 'Title is required.';
    if (!content.trim()) errs.content = 'Content is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(title.trim(), content.trim(), color);
  }

  const selectedColor = COLOR_OPTIONS.find((c) => c.value === color)!;

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" aria-hidden />

      {/* Panel */}
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border border-white/60 ${selectedColor.bg} p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close note modal"
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white/60 rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
          </svg>
        </button>

        <h2 id="note-modal-title" className="text-base font-bold text-slate-800 mb-4">
          {isEditing ? 'Edit Note' : 'New Sticky Note'}
        </h2>

        <form onSubmit={handleSave} noValidate className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="note-title" className="block text-xs font-semibold text-slate-600 mb-1">
              Title <span aria-hidden className="text-rose-400">*</span>
            </label>
            <input
              id="note-title"
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: undefined })); }}
              placeholder="Note title…"
              maxLength={80}
              className={`w-full text-sm text-slate-700 bg-white/70 rounded-xl px-3 py-2 border outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-slate-400 ${
                errors.title ? 'border-rose-300' : 'border-white/60'
              }`}
            />
            {errors.title && (
              <p role="alert" className="text-xs text-rose-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="note-content" className="block text-xs font-semibold text-slate-600 mb-1">
              Content <span aria-hidden className="text-rose-400">*</span>
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => { setContent(e.target.value); setErrors((prev) => ({ ...prev, content: undefined })); }}
              placeholder="Write your note here…"
              rows={5}
              className={`w-full text-sm text-slate-700 bg-white/70 rounded-xl px-3 py-2 border outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-slate-400 resize-none ${
                errors.content ? 'border-rose-300' : 'border-white/60'
              }`}
            />
            {errors.content && (
              <p role="alert" className="text-xs text-rose-500 mt-1">{errors.content}</p>
            )}
          </div>

          {/* Color picker */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Color</p>
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Note color">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={color === opt.value}
                  aria-label={opt.label}
                  onClick={() => setColor(opt.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${opt.bg} ${
                    color === opt.value
                      ? `ring-2 ${opt.ring} ring-offset-1 border-transparent scale-110`
                      : 'border-white/60 hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-slate-600 hover:text-slate-800 bg-white/50 hover:bg-white/80 px-4 py-2 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm font-semibold bg-violet-500 hover:bg-violet-600 text-white px-5 py-2 rounded-xl transition-colors shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
