'use client';

import { useState, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createNootropicsSlice, type NootropicsSlice } from '@/store/slices/nootropics';
import { useHydration } from '@/hooks/useHydration';

const useNootropicsStore = create<NootropicsSlice>()(
  persist(createNootropicsSlice, { name: 'life-os-nootropics' }),
);

export default function NootropicsWidget() {
  const hydrated = useHydration();
  const nootropics = useNootropicsStore((s) => s.nootropics);
  const addNootropic = useNootropicsStore((s) => s.addNootropic);
  const removeNootropic = useNootropicsStore((s) => s.removeNootropic);
  const toggleNootropicStatus = useNootropicsStore((s) => s.toggleNootropicStatus);

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDose, setNewDose] = useState('');

  const handleAdd = useCallback(() => {
    const trimmedName = newName.trim();
    const trimmedDose = newDose.trim();
    if (!trimmedName) return;
    addNootropic(trimmedName, trimmedDose || '\u2014');
    setNewName('');
    setNewDose('');
  }, [newName, newDose, addNootropic]);

  const stats = useMemo(() => {
    const taken = nootropics.filter((n) => n.status === 'taken').length;
    const skipped = nootropics.filter((n) => n.status === 'skipped').length;
    const pending = nootropics.filter((n) => n.status === 'pending').length;
    return { taken, skipped, pending, total: nootropics.length };
  }, [nootropics]);

  const progressPct = stats.total > 0 ? ((stats.taken + stats.skipped) / stats.total) * 100 : 0;

  if (!hydrated) {
    return (
      <div className="widget" aria-label="Widget: Nootropy">
        <div className="widget-header">Nootropy</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '4rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="widget" aria-label="Widget: Nootropy">
      <div className="widget-header">
        <span>Nootropy</span>
        <div className="flex items-center gap-2">
          {stats.total > 0 && (
            <span className="pill" aria-label={`${stats.taken} z ${stats.total} przyjetych`}>
              {stats.taken}/{stats.total}
            </span>
          )}
          <button
            className="btn-secondary"
            onClick={() => setEditing(!editing)}
            aria-label={editing ? 'Zakoncz edycje' : 'Edytuj liste'}
          >
            {editing ? 'Gotowe' : 'Edytuj'}
          </button>
        </div>
      </div>
      <div className="widget-body">
        {editing && (
          <div className="flex gap-2 mb-3">
            <input
              className="input-field flex-1"
              placeholder="Nazwa..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              aria-label="Nazwa nowego nootropu"
            />
            <input
              className="input-field"
              style={{ width: '5rem' }}
              placeholder="Dawka"
              value={newDose}
              onChange={(e) => setNewDose(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              aria-label="Dawka nowego nootropu"
            />
            <button className="btn-primary" onClick={handleAdd} aria-label="Dodaj nootrop">
              +
            </button>
          </div>
        )}

        {/* Progress bar */}
        {stats.total > 0 && (
          <div className="mb-2">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${progressPct}%`,
                  background: stats.taken === stats.total ? 'var(--nom)' : 'var(--a1)',
                }}
              />
            </div>
            <div
              className="flex justify-between mt-0.5"
              style={{ fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)', color: 'var(--txf)' }}
            >
              <span>{stats.taken} przyjete</span>
              {stats.skipped > 0 && <span>{stats.skipped} pominiete</span>}
              {stats.pending > 0 && <span>{stats.pending} oczekuje</span>}
            </div>
          </div>
        )}

        {nootropics.length === 0 ? (
          <div style={{ color: 'var(--txm)' }} className="text-center py-3">
            Brak nootropow. Kliknij Edytuj aby dodac.
          </div>
        ) : (
          <div className="space-y-1">
            {nootropics.map((noot, idx) => (
              <div
                key={`${noot.name}-${idx}`}
                className="flex items-center gap-2 py-1 cursor-pointer rounded px-1 transition-colors"
                style={{ borderBottom: '1px solid var(--div)' }}
                onClick={() => {
                  if (!editing) toggleNootropicStatus(idx);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${noot.name} ${noot.dose} - status: ${noot.status}`}
                onKeyDown={(e) => {
                  if (!editing && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    toggleNootropicStatus(idx);
                  }
                }}
              >
                <span className={`noot-status ${noot.status}`} />
                <span className="flex-1 truncate">{noot.name}</span>
                <span style={{ color: 'var(--txm)' }} className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)]">
                  {noot.dose}
                </span>
                <span
                  style={{
                    fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)',
                    color: noot.status === 'taken' ? 'var(--nom)' : noot.status === 'skipped' ? 'var(--az)' : 'var(--txf)',
                  }}
                >
                  {noot.status === 'taken' ? '\u2713' : noot.status === 'skipped' ? '\u2717' : '\u2022'}
                </span>
                {editing && (
                  <button
                    className="btn-secondary"
                    style={{ padding: '2px 6px', fontSize: '0.6rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNootropic(idx);
                    }}
                    aria-label={`Usun ${noot.name}`}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
