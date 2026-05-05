-- Migration: Add due_date and priority to pins
-- Created: 2026-05-05

ALTER TABLE public.pins ADD COLUMN IF NOT EXISTS due_date timestamptz;
ALTER TABLE public.pins ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('low', 'medium', 'high'));
