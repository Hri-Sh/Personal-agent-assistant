-- L.I.F.E — Demo Seed Data
-- Run this in the Supabase SQL editor AFTER schema.sql (incl. the workouts table).
--
-- ⚠️  This WIPES the listed tables and replaces them with a clean demo dataset
--     so every page looks populated. Remove the TRUNCATE line to append instead.
-- All dates are relative to CURRENT_DATE, so the dashboard/heatmap always look fresh.

TRUNCATE events, habits, habit_completions, goals, goal_tasks,
         meals, fitness_targets, workouts, bucket_lists, bucket_items, skills
  RESTART IDENTITY CASCADE;

-- ─── Events (one+ per weekday so Home + Timetable are always full) ──
INSERT INTO events (title, day, start_hour, start_min, end_hour, end_min, color, description) VALUES
  ('Weekly Review',    0, 18, 0, 19, 0,  '#fb923c', 'Review the past week, adjust priorities, and plan ahead.'),
  ('Morning Run',      1, 7,  0, 8,  0,  '#4ade80', 'Easy 5 km around the neighborhood to start the day.'),
  ('CITS2200 Lecture', 1, 9,  0, 11, 0,  '#60a5fa', 'Attend the lecture and take notes on core concepts.'),
  ('Gym — Push',       1, 17, 0, 18, 30, '#f87171', 'Chest, shoulders, triceps.'),
  ('Study Block',      2, 10, 0, 12, 0,  '#a78bfa', 'Focus time for assignments and revision.'),
  ('Project Work',     2, 14, 0, 16, 0,  '#60a5fa', 'Build features for the L.I.F.E app.'),
  ('Gym — Pull',       3, 17, 0, 18, 30, '#f87171', 'Back, biceps, forearms.'),
  ('Reading',          3, 21, 0, 21, 30, '#a78bfa', '20 minutes before bed.'),
  ('CITS2200 Lab',     4, 13, 0, 15, 0,  '#60a5fa', 'Weekly lab exercises.'),
  ('Gym — Legs',       5, 17, 0, 18, 30, '#f87171', 'Quads, hamstrings, glutes, calves.'),
  ('Meal Prep',        6, 11, 0, 12, 30, '#fb923c', 'Cook and portion meals for the week.'),
  ('Long Run',         6, 8,  0, 9,  0,  '#4ade80', 'Slow, longer distance.');

-- ─── Habits ────────────────────────────────────────────────
INSERT INTO habits (name, frequency, color) VALUES
  ('Morning Run',   'daily',    '#4ade80'),
  ('Read 20 mins',  'daily',    '#60a5fa'),
  ('Gym',           'weekdays', '#f87171'),
  ('Drink Water',   'daily',    '#22d3ee'),
  ('Meal Prep',     'weekly',   '#fb923c');

-- Random ~90 days of history (drives the Insights heatmap)
INSERT INTO habit_completions (habit_id, completed_on)
SELECT h.id, d::date
FROM habits h
CROSS JOIN generate_series((CURRENT_DATE - 89)::timestamp, CURRENT_DATE::timestamp, '1 day') AS d
WHERE random() < 0.6
  AND NOT (h.frequency = 'weekdays' AND EXTRACT(DOW FROM d) IN (0, 6))
ON CONFLICT DO NOTHING;

-- Guaranteed last 14 days for the dailies (gives a visible current streak)
INSERT INTO habit_completions (habit_id, completed_on)
SELECT h.id, d::date
FROM habits h
CROSS JOIN generate_series((CURRENT_DATE - 13)::timestamp, CURRENT_DATE::timestamp, '1 day') AS d
WHERE h.name IN ('Morning Run', 'Read 20 mins', 'Drink Water')
ON CONFLICT DO NOTHING;

-- ─── Goals + sub-tasks ─────────────────────────────────────
INSERT INTO goals (title, description, color) VALUES
  ('Learn React',   'Build L.I.F.E and get comfortable with hooks + state.', '#60a5fa'),
  ('Run a 5K',      'Train up to a continuous 5 km run.',                    '#4ade80'),
  ('Read 12 Books', 'One book a month this year.',                          '#a78bfa');

INSERT INTO goal_tasks (goal_id, title, done)
SELECT g.id, t.title, t.done
FROM goals g
JOIN (VALUES
  ('Learn React',   'Components & props',     TRUE),
  ('Learn React',   'State & hooks',          TRUE),
  ('Learn React',   'Supabase integration',   TRUE),
  ('Learn React',   'Polish + animations',    FALSE),
  ('Run a 5K',      'Run 1 km nonstop',       TRUE),
  ('Run a 5K',      'Run 3 km nonstop',       TRUE),
  ('Run a 5K',      'Run 5 km nonstop',       FALSE),
  ('Read 12 Books', 'Finish book 1',          TRUE),
  ('Read 12 Books', 'Finish book 2',          FALSE),
  ('Read 12 Books', 'Finish book 3',          FALSE)
) AS t(goal, title, done) ON g.title = t.goal;

-- ─── Fitness: targets, meals, workouts ─────────────────────
INSERT INTO fitness_targets (calorie_target, protein_target) VALUES (2300, 160);

-- 13 days of meal history (drives the calorie chart + protein sparkline)
INSERT INTO meals (name, calories, protein_g, carbs_g, fat_g, logged_on)
SELECT m.name, m.cal, m.p, m.c, m.f, d::date
FROM generate_series((CURRENT_DATE - 13)::timestamp, (CURRENT_DATE - 1)::timestamp, '1 day') AS d
CROSS JOIN (VALUES
  ('Oats & berries', 420, 18, 60, 10),
  ('Chicken & rice', 650, 55, 70, 15),
  ('Protein shake',  260, 40, 12, 4),
  ('Salmon & veg',   540, 42, 30, 24)
) AS m(name, cal, p, c, f)
WHERE random() < 0.85;

-- Today's meals (so the target bars are populated right now)
INSERT INTO meals (name, calories, protein_g, carbs_g, fat_g) VALUES
  ('Oats & berries', 420, 18, 60, 10),
  ('Chicken & rice', 650, 55, 70, 15),
  ('Protein shake',  260, 40, 12, 4);

-- Last week of workouts (lights up the body map; repeats add intensity)
INSERT INTO workouts (name, muscles, logged_on) VALUES
  ('Push day',   ARRAY['chest','shoulders','triceps'],            CURRENT_DATE),
  ('Pull day',   ARRAY['lats','biceps','traps','forearms'],       CURRENT_DATE - 1),
  ('Leg day',    ARRAY['quads','hamstrings','glutes','calves'],   CURRENT_DATE - 2),
  ('Core',       ARRAY['abs','obliques','lower-back'],            CURRENT_DATE - 3),
  ('Upper body', ARRAY['chest','lats','shoulders','biceps'],      CURRENT_DATE - 5),
  ('Push day',   ARRAY['chest','shoulders','triceps'],            CURRENT_DATE - 6);

-- ─── Bucket lists + items ──────────────────────────────────
INSERT INTO bucket_lists (name, color) VALUES
  ('Travel',          '#60a5fa'),
  ('Skills to Learn', '#a78bfa'),
  ('Adventures',      '#fb923c');

INSERT INTO bucket_items (list_id, title, done)
SELECT l.id, i.title, i.done
FROM bucket_lists l
JOIN (VALUES
  ('Travel',          'Visit Japan',                 FALSE),
  ('Travel',          'Road trip the coast',         TRUE),
  ('Travel',          'See the Northern Lights',     FALSE),
  ('Skills to Learn', 'Cook 5 signature dishes',     TRUE),
  ('Skills to Learn', 'Play a song on guitar',       FALSE),
  ('Skills to Learn', 'Speak basic Japanese',        FALSE),
  ('Adventures',      'Go skydiving',                FALSE),
  ('Adventures',      'Run a marathon',              FALSE),
  ('Adventures',      'Learn to surf',               TRUE)
) AS i(list, title, done) ON l.name = i.list;

-- ─── Skill tree (roots first, then children by parent name) ─
-- Roots
INSERT INTO skills (name, category, unlocked, parent_id) VALUES
  ('Programming',          'coding',  TRUE, NULL),
  ('Fitness Foundations',  'fitness', TRUE, NULL);

-- Programming branch
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'HTML & CSS', 'coding', TRUE, id FROM skills WHERE name = 'Programming';
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'JavaScript', 'coding', TRUE, id FROM skills WHERE name = 'Programming';
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'Databases', 'coding', FALSE, id FROM skills WHERE name = 'Programming';

INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'Responsive Design', 'coding', TRUE, id FROM skills WHERE name = 'HTML & CSS';
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'React', 'coding', TRUE, id FROM skills WHERE name = 'JavaScript';
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'Hooks', 'coding', TRUE, id FROM skills WHERE name = 'React';
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'State Management', 'coding', FALSE, id FROM skills WHERE name = 'React';
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'Supabase', 'coding', FALSE, id FROM skills WHERE name = 'Databases';

-- Fitness branch
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'Consistent Gym Habit', 'fitness', TRUE, id FROM skills WHERE name = 'Fitness Foundations';
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'Run 5K', 'fitness', FALSE, id FROM skills WHERE name = 'Fitness Foundations';
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'Push/Pull/Legs Split', 'fitness', FALSE, id FROM skills WHERE name = 'Consistent Gym Habit';
INSERT INTO skills (name, category, unlocked, parent_id)
SELECT 'Run 10K', 'fitness', FALSE, id FROM skills WHERE name = 'Run 5K';
