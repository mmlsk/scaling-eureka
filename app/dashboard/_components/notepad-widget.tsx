'use client';

import { useState, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useHydration } from '@/hooks/useHydration';
import { WidgetTabs } from '@/components/widget-parts/widget-tabs';
import { Button } from '@/components/ui/button';

type NoteTab = 'today' | 'week' | 'pinned';

interface NotesSlice {
  notes: string;
  weekNotes: string;
  pinnedNotes: string;
  mdPreview: boolean;
  setNotes: (notes: string) => void;
  setWeekNotes: (notes: string) => void;
  setPinnedNotes: (notes: string) => void;
  togglePreview: () => void;
}

const useNotesStore = create<NotesSlice>()(
  persist(
    (set) => ({
      notes: '',
      weekNotes: '',
      pinnedNotes: '',
      mdPreview: false,
      setNotes: (notes) => set({ notes }),
      setWeekNotes: (weekNotes) => set({ weekNotes }),
      setPinnedNotes: (pinnedNotes) => set({ pinnedNotes }),
      togglePreview: () => set((state) => ({ mdPreview: !state.mdPreview })),
    }),
    { name: 'life-os-notes' },
  ),
);

function renderSimpleMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:0.85rem;font-weight:600;margin:0.5rem 0 0.25rem">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:0.95rem;font-weight:600;margin:0.5rem 0 0.25rem">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:1.05rem;font-weight:700;margin:0.5rem 0 0.25rem">$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.+?)`/g, '<code style="background:var(--soff);padding:1px 4px;border-radius:3px;font-family:IBM Plex Mono,monospace;font-size:0.85em">$1</code>');
  html = html.replace(/^- (.+)$/gm, '<li style="margin-left:1rem">$1</li>');
  html = html.replace(/\n/g, '<br/>');

  return html;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readingTime(text: string): string {
  const words = wordCount(text);
  const mins = Math.ceil(words / 200);
  return mins <= 1 ? '<1 min' : `${mins} min`;
}

export default function NotepadWidget() {
  const hydrated = useHydration();
  const { notes, weekNotes, pinnedNotes, mdPreview, setNotes, setWeekNotes, setPinnedNotes, togglePreview } = useNotesStore();

  const [tab, setTab] = useState<NoteTab>('today');

  const currentText = tab === 'today' ? notes : tab === 'week' ? weekNotes : pinnedNotes;
  const setCurrentText = tab === 'today' ? setNotes : tab === 'week' ? setWeekNotes : setPinnedNotes;

  const handleChange = useCallback(
    (value: string) => {
      setCurrentText(value);
    },
    [setCurrentText],
  );

  const handleExport = useCallback(() => {
    const blob = new Blob([currentText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notatka-${tab}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentText, tab]);

  const stats = useMemo(() => {
    const wc = wordCount(currentText);
    const rt = readingTime(currentText);
    return { words: wc, reading: rt };
  }, [currentText]);

  const TABS: { key: NoteTab; label: string }[] = [
    { key: 'today', label: 'Dzis' },
    { key: 'week', label: 'Tydzien' },
    { key: 'pinned', label: 'Przypiety' },
  ];

  if (!hydrated) {
    return (
      <div className="widget" aria-label="Widget: Notatki">
        <div className="widget-header">Notatki</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '6rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="widget" aria-label="Widget: Notatki">
      <div className="widget-header">
        <span>Notatki</span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            aria-label="Eksportuj do pliku .md"
            title="Eksportuj .md"
            style={{ padding: '2px 6px' }}
          >
            \u2B07
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
            style={mdPreview ? { borderColor: 'var(--a1)', color: 'var(--a1)' } : {}}
            aria-label={mdPreview ? 'Przelacz na edycje' : 'Przelacz na podglad'}
          >
            {mdPreview ? 'Edytuj' : 'Podglad'}
          </Button>
        </div>
      </div>
      <div className="widget-body">
        {/* Tabs */}
        <div style={{ marginBottom: '0.5rem' }}>
          <WidgetTabs tabs={TABS} activeTab={tab} onTabChange={setTab} />
        </div>

        {mdPreview ? (
          <div
            className="min-h-[6rem] max-h-48 overflow-y-auto rounded p-2 text-[clamp(0.6rem,0.58rem+0.12vw,0.72rem)]"
            style={{ background: 'var(--soff)' }}
            dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(currentText || '*Brak notatek*') }}
          />
        ) : (
          <textarea
            className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            style={{
              minHeight: '6rem',
              maxHeight: '12rem',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 'clamp(0.6rem, 0.58rem + 0.12vw, 0.72rem)',
            }}
            value={currentText}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Markdown notatki..."
            aria-label={`Notatka - ${tab === 'today' ? 'dzis' : tab === 'week' ? 'tydzien' : 'przypiety'}`}
          />
        )}

        {/* Stats footer */}
        <div
          className="flex justify-between mt-1"
          style={{ fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)', color: 'var(--txf)' }}
        >
          <span>{stats.words} slow</span>
          <span>{stats.reading} czytania</span>
          <span style={{ color: 'var(--nom)' }}>Auto-zapis</span>
        </div>
      </div>
    </div>
  );
}
