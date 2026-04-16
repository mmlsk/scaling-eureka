'use client';

import { useState, useCallback } from 'react';
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
    addNootropic(trimmedName, trimmedDose || '—');
    setNewName('');
    setNewDose('');
  }, [newName, newDose, addNootropic]);

  if (!hydrated) {
    return (
      <div className="widget">
        <div className="widget-header">Nootropy</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '4rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  const takenCount = nootropics.filter((n) => n.status === 'taken').length;
  const totalCount = nootropics.length;

  return (
    <div className="widget">
      <div className="widget-header">
        <span>Nootropy</span>
        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <span className="pill">
              {takenCount}/{totalCount}
            </span>
          )}
          <button className="btn-secondary" onClick={() => setEditing(!editing)}>
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
            />
            <button className="btn-primary" onClick={handleAdd}>
              +
            </button>
          </div>
        )}

        {nootropics.length === 0 ? (
          <div style={{ color: 'var(--txm)' }} className="text-center py-3">
            Brak nootropów. Kliknij Edytuj aby dodać.
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
              >
                <span className={`noot-status ${noot.status}`} />
                <span className="flex-1 truncate">{noot.name}</span>
                <span style={{ color: 'var(--txm)' }} className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)]">
                  {noot.dose}
                </span>
                {editing && (
                  <button
                    className="btn-secondary"
                    style={{ padding: '2px 6px', fontSize: '0.6rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNootropic(idx);
                    }}
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
