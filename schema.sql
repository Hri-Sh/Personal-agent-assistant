-- L.I.F.E Schema
-- Run this in Supabase SQL editor when ready to go live
-- user_id is nullable for now — add auth later

-- ─── Events ────────────────────────────────────────────────
CREATE TABLE events (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  day         SMALLINT NOT NULL CHECK (day BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
  start_hour  SMALLINT NOT NULL,
  start_min   SMALLINT NOT NULL DEFAULT 0,
  end_hour    SMALLINT NOT NULL,
  end_min     SMALLINT NOT NULL DEFAULT 0,
  color       TEXT NOT NULL DEFAULT '#4ade80',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Habits ────────────────────────────────────────────────
-- One row per habit definition
CREATE TABLE habits (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  frequency   TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekly')),
  color       TEXT NOT NULL DEFAULT '#4ade80',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- One row per completion (replaces completedDates array in local state)
CREATE TABLE habit_completions (
  id           BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  habit_id     BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (habit_id, completed_on) -- can't complete the same habit twice on the same day
);

-- ─── Goals ─────────────────────────────────────────────────
CREATE TABLE goals (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  color       TEXT NOT NULL DEFAULT '#4ade80',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE goal_tasks (
  id        BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  goal_id   BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  done      BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── Fitness / Calories ────────────────────────────────────
CREATE TABLE meals (
  id           BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  calories     INT NOT NULL,
  protein_g    INT DEFAULT 0,
  carbs_g      INT DEFAULT 0,
  fat_g        INT DEFAULT 0,
  logged_on    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fitness_targets (
  id              BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calorie_target  INT NOT NULL DEFAULT 2000,
  protein_target  INT DEFAULT 150,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts — each logs the muscle groups trained (drives the body map)
CREATE TABLE workouts (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  muscles     TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'chest','triceps'}
  logged_on   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Bucket List ───────────────────────────────────────────
CREATE TABLE bucket_lists (
  id         BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL, -- e.g. "Travel", "Skills"
  color      TEXT NOT NULL DEFAULT '#4ade80',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bucket_items (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  list_id     BIGINT NOT NULL REFERENCES bucket_lists(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  done        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Skill Tree ────────────────────────────────────────────
CREATE TABLE skills (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT DEFAULT 'general',
  color       TEXT NOT NULL DEFAULT '#4ade80',
  unlocked    BOOLEAN NOT NULL DEFAULT FALSE,
  parent_id   BIGINT REFERENCES skills(id) ON DELETE SET NULL, -- for tree structure
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
