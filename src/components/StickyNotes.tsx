import { useState, useMemo } from 'react';
import type { Note, NoteColor } from '../data/types';
import NoteModal from './NoteModal';

interface Props {
  notes: Note[];
  onAdd:    (title: string, content: string, color: NoteColor) => void;
  onUpdate: (id: string, changes: Partial<Pick<Note, 'title' | 'content' | 'color' | 'pinned'>>) => void;
  onDelete: (id: string) => void;
  onPin:    (id: string) => void;
}

// ── Colour map ─────────────────────────────────────────────────────────────────
const COLOR_STYLES: Record<NoteColor, { card: string; header: string; tag: string }> = {
  lavender: {
    card:   'bg-violet-50  border-violet-200',
    header: 'bg-violet-100',
    tag:    'bg-violet-200 text-violet-700',
  },
  blue: {
    card:   'bg-blue-50    border-blue-200',
    header: 'bg-blue-100',
    tag:    'bg-blue-200   text-blue-700',
  },
  green: {
    card:   'bg-emerald-50 border-emerald-200',
    header: 'bg-emerald-100',
    tag:    'bg-emerald-200 text-emerald-700',
  },
  yellow: {
    card:   'bg-yellow-50  border-yellow-200',
    header: 'bg-yellow-100',
    tag:    'bg-yellow-200  text-yellow-700',
  },
  pink: {
    card:   'bg-pink-50    border-pink-200',
    header: 'bg-pink-100',
    tag:    'bg-pink-200   text-pink-700',
  },
};

// ── Individual note card ───────────────────────────────────────────────────────
interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}

function NoteCard({ note, onEdit, onDelete, onPin }: NoteCardProps) {
  const styles = COLOR_STYLES[note.color];
  const updatedDate = new Date(note.updatedAt);
  const dateStr = updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <article
      className={`rounded-2xl border ${styles.card} flex flex-col overflow-hidden group transition-shadow hover:shadow-md`}
      aria-label={`Note: ${note.title}`}
    >
      {/* Card header bar */}
      <div className={`${styles.header} px-4 py-2.5 flex items-center justify-between`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {note.pinned && (
            <span aria-label="Pinned" title="Pinned" className="text-slate-500 shrink-0">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M4.456.734a1.75 1.75 0 012.826.504l.613 1.327a3.081 3.081 0 002.084 1.707l2.454.584c.515.123.821.628.67 1.133l-.163.542a1.75 1.75 0 01-1.846 1.25l-1.021-.106 1.092 3.273-.209.064-3.116-2.754-.155.548a1.75 1.75 0 01-2.373 1.148l-.34-.149-1.5 3.442-.82-.357 1.5-3.442-.341-.149a1.75 1.75 0 01-.982-2.218l.165-.548-1.021-.105A1.75 1.75 0 011.8 4.697l.163-.542A1.088 1.088 0 012.93 3.4l2.453-.583a3.082 3.082 0 001.729-1.179l-.656-1.904z" />
              </svg>
            </span>
          )}
          <h3 className="text-sm font-bold text-slate-800 truncate">{note.title}</h3>
        </div>
        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
          <button
            onClick={onPin}
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            title={note.pinned ? 'Unpin' : 'Pin to top'}
            className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
              note.pinned ? 'text-violet-500 hover:text-violet-700' : 'text-slate-400 hover:text-violet-500'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M4.456.734a1.75 1.75 0 012.826.504l.613 1.327a3.081 3.081 0 002.084 1.707l2.454.584c.515.123.821.628.67 1.133l-.163.542a1.75 1.75 0 01-1.846 1.25l-1.021-.106 1.092 3.273-.209.064-3.116-2.754-.155.548a1.75 1.75 0 01-2.373 1.148l-.34-.149-1.5 3.442-.82-.357 1.5-3.442-.341-.149a1.75 1.75 0 01-.982-2.218l.165-.548-1.021-.105A1.75 1.75 0 011.8 4.697l.163-.542A1.088 1.088 0 012.93 3.4l2.453-.583a3.082 3.082 0 001.729-1.179l-.656-1.904z" />
            </svg>
          </button>
          <button
            onClick={onEdit}
            aria-label={`Edit note: ${note.title}`}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-violet-500 rounded-lg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.34 11.22a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.25.25 0 00.108-.064L11.19 6.25z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            aria-label={`Delete note: ${note.title}`}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 00.249.225h5.19a.25.25 0 00.249-.225l.66-6.6a.75.75 0 011.492.149l-.66 6.6A1.748 1.748 0 0110.595 15H5.405a1.748 1.748 0 01-1.741-1.575l-.66-6.6a.75.75 0 111.492-.15z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex-1">
        <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed line-clamp-6">
          {note.content}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{dateStr}</span>
        {note.pinned && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles.tag}`}>
            Pinned
          </span>
        )}
      </div>
    </article>
  );
}

// ── Main StickyNotes component ─────────────────────────────────────────────────
export default function StickyNotes({ notes, onAdd, onUpdate, onDelete, onPin }: Props) {
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [search, setSearch]           = useState('');

  // Filter by search, then sort pinned first, then by updatedAt desc
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const matching = q
      ? notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
        )
      : notes;
    return [...matching].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, search]);

  function openCreate() {
    setEditingNote(undefined);
    setModalOpen(true);
  }

  function openEdit(note: Note) {
    setEditingNote(note);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingNote(undefined);
  }

  function handleSave(title: string, content: string, color: NoteColor) {
    if (editingNote) {
      onUpdate(editingNote.id, { title, content, color });
    } else {
      onAdd(title, content, color);
    }
    closeModal();
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-400" />
              <h2 className="text-base font-bold text-slate-800">Sticky Notes</h2>
              <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                {notes.length}
              </span>
            </div>
            <button
              onClick={openCreate}
              aria-label="Create new sticky note"
              className="flex items-center gap-1.5 text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-xl transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
              </svg>
              Create Note
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden
            >
              <path d="M10.68 11.74a6 6 0 01-7.922-8.982 6 6 0 018.982 7.922l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04zm-5.44-9.56a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              aria-label="Search sticky notes"
              className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Notes grid */}
        <div className="p-5">
          {notes.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-3">📌</p>
              <p className="text-sm font-medium text-slate-500">Create your first sticky note.</p>
              <p className="text-xs text-slate-400 mt-1">
                Notes are great for quick reminders and revision points.
              </p>
              <button
                onClick={openCreate}
                className="mt-4 text-xs font-semibold text-pink-500 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 border-dashed rounded-xl px-4 py-2 transition-colors"
              >
                + Create your first note
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm text-slate-500">No notes match "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => openEdit(note)}
                  onDelete={() => onDelete(note.id)}
                  onPin={() => onPin(note.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal portal */}
      {modalOpen && (
        <NoteModal
          note={editingNote}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </>
  );
}
