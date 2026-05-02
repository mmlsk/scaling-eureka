import { z } from 'zod';

// ── Database Entity Schemas ──

export const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  display_name: z.string().nullable(),
  timezone: z.string(),
  dashboard_layout: z.array(z.object({
    id: z.string(),
    w: z.number(),
    h: z.number(),
    x: z.number().optional(),
    y: z.number().optional(),
  })),
  settings: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
});

export const HabitSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  created_at: z.string(),
  archived: z.boolean(),
});

export const HabitEntrySchema = z.object({
  id: z.string(),
  habit_id: z.string(),
  date: z.string(),
  completed: z.boolean(),
  created_at: z.string(),
});

export const TodoSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  text: z.string(),
  done: z.boolean(),
  priority: z.number(),
  created_at: z.string(),
  completed_at: z.string().nullable(),
  archived: z.boolean(),
});

export const NootropicSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  dose: z.string().nullable(),
  order: z.number(),
  active: z.boolean(),
  created_at: z.string(),
});

export const NootropicLogEntrySchema = z.object({
  id: z.string(),
  nootropic_id: z.string(),
  date: z.string(),
  status: z.enum(['pending', 'taken', 'skipped']),
  taken_at: z.string().nullable(),
});

export const SleepEntrySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  date: z.string(),
  sleep_start: z.string().nullable(),
  sleep_stop: z.string().nullable(),
  total_minutes: z.number().nullable(),
  quality: z.enum(['bad', 'med', 'good']).nullable(),
  created_at: z.string(),
});

export const CalendarEventSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  date: z.string(),
  time: z.string().nullable(),
  description: z.string().nullable(),
  source: z.string(),
  created_at: z.string(),
});

export const NoteSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  content: z.string(),
  updated_at: z.string(),
});

export const MoodEntrySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  date: z.string(),
  feelings: z.array(z.string()),
  created_at: z.string(),
});

export const TimerSessionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  date: z.string(),
  work_minutes: z.number(),
  break_minutes: z.number(),
  linked_todo_id: z.string().nullable(),
  started_at: z.string(),
});

export const EventStoreEntrySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  sheet: z.string(),
  data: z.record(z.string(), z.unknown()),
  created_at: z.string(),
});

export const NoteEmbeddingSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  source_type: z.enum(['note', 'todo', 'habit', 'mood']),
  source_id: z.string().nullable(),
  content: z.string(),
  embedding: z.array(z.number()),
  created_at: z.string(),
});

export const SyncQueueEntrySchema = z.object({
  id: z.number().optional(),
  table: z.enum([
    'habits',
    'habitEntries',
    'todos',
    'nootropicStack',
    'nootropicLog',
    'sleepLog',
    'calendarEvents',
    'notes',
    'moodEntries',
    'timerSessions',
    'eventStore',
  ]),
  operation: z.enum(['insert', 'update', 'delete']),
  record_id: z.string(),
  data: z.record(z.string(), z.unknown()),
  synced: z.boolean(),
  created_at: z.string(),
});

// ── Widget Layout Schemas ──
export const WidgetLayoutItemSchema = z.object({
  id: z.string(),
  w: z.number(),
  h: z.number(),
  x: z.number().optional(),
  y: z.number().optional(),
});

// ── Dashboard Data Schemas ──
export const DashboardDataSchema = z.object({
  habits: z.array(z.object({
    id: z.string(),
    user_id: z.string(),
    name: z.string(),
    created_at: z.string(),
    archived: z.boolean(),
    entries: z.array(z.object({
      date: z.string(),
      completed: z.boolean(),
    })),
  })).nullable(),
  todos: z.array(z.object({
    id: z.string(),
    text: z.string(),
    done: z.boolean(),
    priority: z.number(),
    created_at: z.string(),
  })).nullable(),
  nootropics: z.array(z.object({
    id: z.string(),
    name: z.string(),
    dose: z.string().nullable(),
    status: z.string(),
  })).nullable(),
  sleep: z.object({
    sleep_start: z.string().nullable(),
    sleep_stop: z.string().nullable(),
    total_minutes: z.number().nullable(),
    quality: z.enum(['bad', 'med', 'good']).nullable(),
  }).nullable(),
  mood: z.object({
    feelings: z.array(z.string()),
  }).nullable(),
  timer_sessions: z.number(),
  calendar_events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    date: z.string(),
    time: z.string().nullable(),
    description: z.string().nullable(),
  })).nullable(),
  notes: z.string().nullable(),
});

// ── Type Guards ──
export function isProfile(data: unknown): data is z.infer<typeof ProfileSchema> {
  return ProfileSchema.safeParse(data).success;
}

export function isHabit(data: unknown): data is z.infer<typeof HabitSchema> {
  return HabitSchema.safeParse(data).success;
}

export function isTodo(data: unknown): data is z.infer<typeof TodoSchema> {
  return TodoSchema.safeParse(data).success;
}

export function isSleepEntry(data: unknown): data is z.infer<typeof SleepEntrySchema> {
  return SleepEntrySchema.safeParse(data).success;
}

export function isCalendarEvent(data: unknown): data is z.infer<typeof CalendarEventSchema> {
  return CalendarEventSchema.safeParse(data).success;
}

export function isNote(data: unknown): data is z.infer<typeof NoteSchema> {
  return NoteSchema.safeParse(data).success;
}

export function isMoodEntry(data: unknown): data is z.infer<typeof MoodEntrySchema> {
  return MoodEntrySchema.safeParse(data).success;
}

export function isTimerSession(data: unknown): data is z.infer<typeof TimerSessionSchema> {
  return TimerSessionSchema.safeParse(data).success;
}

export function isSyncQueueEntry(data: unknown): data is z.infer<typeof SyncQueueEntrySchema> {
  return SyncQueueEntrySchema.safeParse(data).success;
}

// ── Inferred Types ──
export type Profile = z.infer<typeof ProfileSchema>;
export type Habit = z.infer<typeof HabitSchema>;
export type Todo = z.infer<typeof TodoSchema>;
export type SleepEntry = z.infer<typeof SleepEntrySchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type MoodEntry = z.infer<typeof MoodEntrySchema>;
export type TimerSession = z.infer<typeof TimerSessionSchema>;
export type SyncQueueEntry = z.infer<typeof SyncQueueEntrySchema>;

// ── Validation Functions ──
export function validateProfile(data: unknown): z.infer<typeof ProfileSchema> {
  return ProfileSchema.parse(data);
}

export function validateHabit(data: unknown): z.infer<typeof HabitSchema> {
  return HabitSchema.parse(data);
}

export function validateTodo(data: unknown): z.infer<typeof TodoSchema> {
  return TodoSchema.parse(data);
}

export function validateSleepEntry(data: unknown): z.infer<typeof SleepEntrySchema> {
  return SleepEntrySchema.parse(data);
}

export function validateCalendarEvent(data: unknown): z.infer<typeof CalendarEventSchema> {
  return CalendarEventSchema.parse(data);
}

export function validateNote(data: unknown): z.infer<typeof NoteSchema> {
  return NoteSchema.parse(data);
}

export function validateMoodEntry(data: unknown): z.infer<typeof MoodEntrySchema> {
  return MoodEntrySchema.parse(data);
}

export function validateTimerSession(data: unknown): z.infer<typeof TimerSessionSchema> {
  return TimerSessionSchema.parse(data);
}

export function validateSyncQueueEntry(data: unknown): z.infer<typeof SyncQueueEntrySchema> {
  return SyncQueueEntrySchema.parse(data);
}