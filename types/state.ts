export interface SleepState {
  start: string | null;
  stop: string | null;
  total: string | null;
}

export interface TimerPreset {
  work: number;
  break: number;
  label: string;
}

export interface TimerState {
  presetIndex: number;
  presets: TimerPreset[];
  running: boolean;
  remaining: number;
  total: number;
  session: number;
  lastTick: number | null;
}

export interface StockItem {
  tk: string;
  n: string;
  p: string;
  c: string;
  up: boolean;
}

export interface PizzaIndex {
  city: string;
  price: number;
}

export interface LocalHabit {
  n: string;
  d: number[];
  s: number;
  lastDate?: string;
}

export interface LocalTodo {
  t: string;
  done: boolean;
  p: 'H' | 'M' | 'L';
  archivedAt?: string;
}

export interface LocalNootropic {
  name: string;
  dose: string;
  status: 'pending' | 'taken' | 'skipped';
}

export interface AirQuality {
  pm25: number;
  pm10: number;
  uv: number;
}

export interface UVData {
  uv: number;
  uvMax: number;
}

export interface IMGWAlert {
  voivodeship?: string;
  description?: string;
  phenomena?: string;
}

export interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export interface EventStoreSheets {
  sleep: EventRecord[];
  habits: EventRecord[];
  nootropics: EventRecord[];
  todos: EventRecord[];
  timer: EventRecord[];
  weather: EventRecord[];
  mood: EventRecord[];
}

export interface EventRecord {
  timestamp: string;
  [key: string]: unknown;
}

export interface AppState {
  palette: string;
  theme: 'dark' | 'light';
  sleepQuality: 'bad' | 'med' | 'good';
  sleep: SleepState;
  feelings: string[];
  feelingOptions: string[];
  todos: LocalTodo[];
  habits: LocalHabit[];
  notes: string;
  nootropics: LocalNootropic[];
  refills: RefillItem[];
  stocks: StockItem[];
  timer: TimerState;
  weather: WeatherData | null;
  calendarEvents: CalendarEventLocal[];
  nootropicLog: Record<string, Record<string, string>>;
  sleepLog: Record<string, Record<string, string>>;
  archivedTodos: (LocalTodo & { archivedAt?: string })[];
  eventStore: { version: number; sheets: EventStoreSheets };
  holidays: HolidayEntry[];
  mergedCalEvents: CalendarEventLocal[];
  mdPreview: boolean;
  pizzaIndex: PizzaIndex[];
  airQuality: AirQuality | null;
  uvData: UVData | null;
  imgwAlerts: IMGWAlert[];
}

export interface RefillItem {
  name: string;
  pct: number;
  days: string;
  color: string;
  critical: boolean;
}

export interface CalendarEventLocal {
  title: string;
  date: string;
  time?: string | null;
  desc?: string | null;
  source?: string;
  id?: string;
  end?: string;
}

export interface HolidayEntry {
  title: string;
  date: string;
  localName?: string;
  source?: string;
}

export type Palette = 'reaktor' | 'strefa' | 'zimna' | 'niebieski' | 'nocny' | 'biala';
