-- Migration: Add image_url column to rooms table for floor plan background images

ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS image_url text;

-- Comment to document the column
COMMENT ON COLUMN public.rooms.image_url IS 'Optional background image URL for the room (stored in Supabase Storage)';
