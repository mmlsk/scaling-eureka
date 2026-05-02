// Validation module exports
export * from './api-schemas';
export * from './database-schemas';
export * from './type-guards';

// Re-export commonly used types from api-schemas
export type {
  WeatherExtended,
  AirQualityExtended,
  UVExtended,
  QuoteResult,
  FREDResponse,
  EIAResponse,
} from './api-schemas';

// Re-export commonly used types from database-schemas
export type {
  Profile,
  Habit,
  Todo,
  SleepEntry,
  CalendarEvent,
  Note,
} from './database-schemas';

export type {
  MoodEntry,
  TimerSession,
  SyncQueueEntry,
} from './database-schemas';

export type {
  Profile as DBProfile,
  Habit as DBHabit,
  Todo as DBTodo,
  SleepEntry as DBSleepEntry,
  CalendarEvent as DBCalendarEvent,
  Note as DBNote,
  MoodEntry as DBMoodEntry,
  TimerSession as DBTimerSession,
  SyncQueueEntry as DBSyncQueueEntry,
} from './database-schemas';