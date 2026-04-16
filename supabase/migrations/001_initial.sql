-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  timezone TEXT DEFAULT 'Europe/Warsaw',
  dashboard_layout JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habits
CREATE TABLE public.habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  archived BOOLEAN DEFAULT false
);

CREATE TABLE public.habit_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Todos
CREATE TABLE public.todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT false
);

-- Nootropics
CREATE TABLE public.nootropic_stack (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT,
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.nootropic_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nootropic_id UUID REFERENCES public.nootropic_stack(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'skipped')),
  taken_at TIMESTAMPTZ,
  UNIQUE(nootropic_id, date)
);

-- Sleep
CREATE TABLE public.sleep_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_start TIME,
  sleep_stop TIME,
  total_minutes INTEGER,
  quality TEXT CHECK (quality IN ('bad', 'med', 'good')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Calendar events (local)
CREATE TABLE public.calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  description TEXT,
  source TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notes
CREATE TABLE public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Feelings / mood
CREATE TABLE public.mood_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  feelings TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Timer sessions
CREATE TABLE public.timer_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  work_minutes INTEGER NOT NULL,
  break_minutes INTEGER DEFAULT 0,
  linked_todo_id UUID REFERENCES public.todos(id),
  started_at TIMESTAMPTZ DEFAULT now()
);

-- Event Store (general purpose logging)
CREATE TABLE public.event_store (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sheet TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_event_store_sheet ON public.event_store(user_id, sheet, created_at DESC);

-- AI: Note embeddings for contextual assistant
CREATE TABLE public.note_embeddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id UUID,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_note_embeddings_vector ON public.note_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nootropic_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nootropic_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'habits', 'habit_entries', 'todos', 'nootropic_stack', 'nootropic_log',
    'sleep_log', 'calendar_events', 'notes', 'mood_entries', 'timer_sessions',
    'event_store', 'note_embeddings'
  ]) LOOP
    EXECUTE format('CREATE POLICY "Users own data select" ON public.%I FOR SELECT USING (user_id = auth.uid())', t);
    EXECUTE format('CREATE POLICY "Users own data insert" ON public.%I FOR INSERT WITH CHECK (user_id = auth.uid())', t);
    EXECUTE format('CREATE POLICY "Users own data update" ON public.%I FOR UPDATE USING (user_id = auth.uid())', t);
    EXECUTE format('CREATE POLICY "Users own data delete" ON public.%I FOR DELETE USING (user_id = auth.uid())', t);
  END LOOP;
END;
$$;
