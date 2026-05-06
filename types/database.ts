export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  timezone: string;
  dashboard_layout: WidgetLayoutItem[];
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  archived: boolean;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  text: string;
  done: boolean;
  priority: number;
  created_at: string;
  completed_at: string | null;
  archived: boolean;
}

export interface Nootropic {
  id: string;
  user_id: string;
  name: string;
  dose: string | null;
  order: number;
  active: boolean;
  created_at: string;
}

export interface NootropicLogEntry {
  id: string;
  nootropic_id: string;
  date: string;
  status: 'pending' | 'taken' | 'skipped';
  taken_at: string | null;
}

export interface SleepEntry {
  id: string;
  user_id: string;
  date: string;
  sleep_start: string | null;
  sleep_stop: string | null;
  total_minutes: number | null;
  quality: 'bad' | 'med' | 'good' | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string | null;
  description: string | null;
  source: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  content: string;
  updated_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  feelings: string[];
  created_at: string;
}

export interface TimerSession {
  id: string;
  user_id: string;
  date: string;
  work_minutes: number;
  break_minutes: number;
  linked_todo_id: string | null;
  started_at: string;
}

export interface EventStoreEntry {
  id: string;
  user_id: string;
  sheet: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface NoteEmbedding {
  id: string;
  user_id: string;
  source_type: 'note' | 'todo' | 'habit' | 'mood' | 'sleep' | 'calendar' | 'nootropic' | 'timer' | 'event';
  source_id: string | null;
  content: string;
  embedding: number[];
  created_at: string;
}

export interface WidgetLayoutItem {
  id: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
}

export interface DashboardData {
  habits: (Habit & { entries: Pick<HabitEntry, 'date' | 'completed'>[] })[] | null;
  todos: Pick<Todo, 'id' | 'text' | 'done' | 'priority' | 'created_at'>[] | null;
  nootropics: (Pick<Nootropic, 'id' | 'name' | 'dose'> & { status: string })[] | null;
  sleep: Pick<SleepEntry, 'sleep_start' | 'sleep_stop' | 'total_minutes' | 'quality'> | null;
  mood: { feelings: string[] } | null;
  timer_sessions: number;
  calendar_events: Pick<CalendarEvent, 'id' | 'title' | 'date' | 'time' | 'description'>[] | null;
  notes: string | null;
}

export interface SyncQueueEntry {
  id?: number;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  record_id: string;
  data: Record<string, unknown>;
  synced: boolean;
  created_at: string;
}
