'use client';

import { useState, useMemo, useCallback } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

interface CalendarEvent {
  title: string;
  date: string;
  time?: string | null;
  desc?: string | null;
}

interface HolidayEntry {
  title: string;
  date: string;
}

const DAY_LABELS_PL = ['Pn', 'Wt', 'Sr', 'Cz', 'Pt', 'Sb', 'Nd'] as const;

const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
] as const;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-start: Mon=0, Tue=1, ... Sun=6
  return day === 0 ? 6 : day - 1;
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarWidget() {
  const hydrated = useHydration();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [holidays] = useState<HolidayEntry[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const todayKey = useMemo(() => {
    return toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  }, [today]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date]!.push(ev);
    }
    return map;
  }, [events]);

  const holidayDates = useMemo(() => {
    return new Set(holidays.map((h) => h.date));
  }, [holidays]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }, [viewMonth, viewYear]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }, [viewMonth, viewYear]);

  const handleAddEvent = useCallback(() => {
    if (!newTitle.trim() || !newDate) return;
    setEvents((prev) => [
      ...prev,
      { title: newTitle.trim(), date: newDate, time: newTime || null },
    ]);
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setShowModal(false);
  }, [newTitle, newDate, newTime]);

  if (!hydrated) {
    return (
      <div className="widget">
        <div className="widget-header">Kalendarz</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '8rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  const cells: Array<{ day: number | null; key: string }> = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: `day-${d}` });
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="xs" onClick={prevMonth}>
            &lt;
          </Button>
          <span>
            {MONTHS_PL[viewMonth]} {viewYear}
          </span>
          <Button variant="outline" size="xs" onClick={nextMonth}>
            &gt;
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
          + Wydarzenie
        </Button>
      </div>
      <div className="widget-body">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-[2px] mb-1">
          {DAY_LABELS_PL.map((label) => (
            <div
              key={label}
              className="text-center text-[clamp(0.45rem,0.43rem+0.08vw,0.55rem)]"
              style={{ color: 'var(--txm)' }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-[2px]">
          {cells.map((cell) => {
            if (cell.day === null) {
              return <div key={cell.key} />;
            }

            const dateKey = toDateKey(viewYear, viewMonth, cell.day);
            const isToday = dateKey === todayKey;
            const hasEvents = !!eventsByDate[dateKey]?.length;
            const isHoliday = holidayDates.has(dateKey);

            return (
              <div
                key={cell.key}
                className="relative flex flex-col items-center justify-center rounded py-0.5"
                style={{
                  background: isToday
                    ? 'var(--a1d)'
                    : isHoliday
                      ? 'rgba(194,49,39,0.08)'
                      : 'transparent',
                  border: isToday ? '1px solid var(--a1)' : '1px solid transparent',
                  minHeight: '1.6rem',
                }}
              >
                <span
                  className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)]"
                  style={{
                    color: isToday ? 'var(--a1)' : isHoliday ? 'var(--az)' : 'var(--tx)',
                    fontWeight: isToday ? 600 : 400,
                  }}
                >
                  {cell.day}
                </span>
                {hasEvents && (
                  <span
                    className="absolute bottom-0.5 w-1 h-1 rounded-full"
                    style={{ background: 'var(--a1)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nowe wydarzenie">
        <div className="space-y-3">
          <Input
            placeholder="Tytuł..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <Input
            type="date"
            className="font-mono"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <Input
            type="time"
            className="font-mono"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
          <Button className="w-full" onClick={handleAddEvent}>
            Dodaj wydarzenie
          </Button>
        </div>
      </Modal>
    </div>
  );
}
