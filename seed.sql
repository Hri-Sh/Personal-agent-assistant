-- L.I.F.E — Seed Data
-- Run this in the Supabase SQL editor after running schema.sql

INSERT INTO events (title, day, start_hour, start_min, end_hour, end_min, color, description) VALUES
  ('Morning Run',      1, 7,  0, 8,  0,  '#4ade80', 'Easy 5 km around the neighborhood to start the day.'),
  ('CITS2200 Lecture', 1, 9,  0, 11, 0,  '#60a5fa', 'Attend the lecture and take notes on the week''s core concepts.'),
  ('Gym',              1, 17, 0, 18, 30, '#f87171', 'Upper-body strength session followed by a short cooldown.'),
  ('Study Block',      3, 10, 0, 12, 0,  '#a78bfa', 'Focus time for assignments, readings, and revision.'),
  ('Weekly Review',    0, 18, 0, 19, 0,  '#fb923c', 'Review the past week, adjust priorities, and plan ahead.');

INSERT INTO habits (name, frequency, color) VALUES
  ('Morning Run',   'daily',    '#4ade80'),
  ('Read 20 mins',  'daily',    '#60a5fa'),
  ('Gym',           'weekdays', '#f87171'),
  ('Weekly Review', 'weekly',   '#a78bfa'),
  ('Meal Prep',     'weekly',   '#fb923c');
