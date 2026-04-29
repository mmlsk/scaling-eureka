// Validation module exports
export * from './api-schemas';
export * from './database-schemas';
export * from './type-guards';

// Re-export commonly used types
export type {
  WeatherExtended,
  AirQualityExtended,
  UVExtended,
  QuoteResult,
  FREDResponse,
  EIAResponse,
  Profile,
  Habit,
  Todo,
  SleepEntry,
  CalendarEvent,
  Note,
  MoodEntry,
  TimerSession,
  SyncQueueEntry,
} from './api-schemas';

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