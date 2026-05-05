-- supabase/migrations/001_floor_plan_tables.sql

-- Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  x real NOT NULL CHECK (x >= 0.0 AND x <= 1.0),
  y real NOT NULL CHECK (y >= 0.0 AND y <= 1.0),
  width real NOT NULL CHECK (width > 0 AND width <= 1.0),
  height real NOT NULL CHECK (height > 0 AND height <= 1.0),
  color text NOT NULL DEFAULT '#3b82f6',
  order integer NOT NULL DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- RLS for rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rooms"
  ON public.rooms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own rooms"
  ON public.rooms FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Pins table
CREATE TABLE IF NOT EXISTS public.pins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  x real NOT NULL CHECK (x >= 0.0 AND x <= 1.0),
  y real NOT NULL CHECK (y >= 0.0 AND y <= 1.0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done')),
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- RLS for pins
ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pins"
  ON public.pins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own pins"
  ON public.pins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Checklist items table
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pin_id uuid REFERENCES public.pins(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  order integer NOT NULL DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- RLS for checklist_items
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist items"
  ON public.checklist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own checklist items"
  ON public.checklist_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pins_updated_at BEFORE UPDATE ON public.pins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON public.rooms(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pins_user_id ON public.pins(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pins_room_id ON public.pins(room_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checklist_items_user_id ON public.checklist_items(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checklist_items_pin_id ON public.checklist_items(pin_id) WHERE deleted_at IS NULL;
