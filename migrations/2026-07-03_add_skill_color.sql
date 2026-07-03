-- Migration: add per-skill color (feature/skill-tree)
-- Run in Supabase SQL editor.

ALTER TABLE skills
  ADD COLUMN color TEXT NOT NULL DEFAULT '#4ade80';

-- Backfill from the old category→color mapping so nothing visually changes
UPDATE skills SET color = CASE LOWER(COALESCE(category, 'general'))
  WHEN 'fitness'  THEN '#f87171'
  WHEN 'coding'   THEN '#60a5fa'
  WHEN 'learning' THEN '#a78bfa'
  WHEN 'career'   THEN '#fb923c'
  WHEN 'creative' THEN '#fb923c'
  ELSE '#4ade80'
END;
