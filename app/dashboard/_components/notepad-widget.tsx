'use client';

import { useState, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useHydration } from '@/hooks/useHydration';

interface NotesSlice {
  notes: string;
  mdPreview: boolean;
  setNotes: (notes: string) => void;
  togglePreview: () => void;
}

const useNotesStore = create<NotesSlice>()(
  persist(
    (set) => ({
      notes: '',
      mdPreview: false,
      setNotes: (notes) => set({ notes }),
      togglePreview: () => set((state) => ({ mdPreview: !state.mdPreview })),
    }),
    { name: 'life-os-notes' },
  ),
);

function renderSimpleMarkdown(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:0.85rem;font-weight:600;margin:0.5rem 0 0.25rem">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:0.95rem;font-weight:600;margin:0.5rem 0 0.25rem">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:1.05rem;font-weight:700;margin:0.5rem 0 0.25rem">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code
  html = html.replace(/`(.+?)`/g, '<code style="background:var(--soff);padding:1px 4px;border-radius:3px;font-family:IBM Plex Mono,monospace;font-size:0.85em">$1</code>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li style="margin-left:1rem">$1</li>');

  // Line breaks
  html = html.replace(/\n/g, '<br/>');

  return html;
}

export default function NotepadWidget() {
  const hydrated = useHydration();
  const notes = useNotesStore((s) => s.notes);
  const mdPreview = useNotesStore((s) => s.mdPreview);
  const setNotes = useNotesStore((s) => s.setNotes);
  const togglePreview = useNotesStore((s) => s.togglePreview);

  const [localNotes, setLocalNotes] = useState<string | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      setLocalNotes(value);
      setNotes(value);
    },
    [setNotes],
  );

  if (!hydrated) {
    return (
      <div className="widget">
        <div className="widget-header">Notatki</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '6rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  const displayNotes = localNotes !== null ? localNotes : notes;

  return (
    <div className="widget">
      <div className="widget-header">
        <span>Notatki</span>
        <button
          className="btn-secondary"
          onClick={togglePreview}
          style={mdPreview ? { borderColor: 'var(--a1)', color: 'var(--a1)' } : {}}
        >
          {mdPreview ? 'Edytuj' : 'Podgląd'}
        </button>
      </div>
      <div className="widget-body">
        {mdPreview ? (
          <div
            className="min-h-[8rem] max-h-52 overflow-y-auto rounded p-2 text-[clamp(0.6rem,0.58rem+0.12vw,0.72rem)]"
            style={{ background: 'var(--soff)' }}
            dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(displayNotes || '*Brak notatek*') }}
          />
        ) : (
          <textarea
            className="input-field w-full resize-none"
            style={{
              minHeight: '8rem',
              maxHeight: '14rem',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)',
            }}
            value={displayNotes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Markdown notatki..."
          />
        )}
      </div>
    </div>
  );
}
