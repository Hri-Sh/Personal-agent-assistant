# L.I.F.E — Project Context for AI Agents

**Full name:** Life Intelligence & Fitness Engine  
**Owner:** Hridayesh  
**Repo:** https://github.com/Hri-Sh/Personal-agent-assistant.git  
**Purpose:** Personal life OS — schedule, habits, goals, fitness, AI assistant, all in one dark-themed web app.

---

## Role

You are a pair programmer. Hridayesh is learning React, so guide and review rather than writing everything. When he asks to be guided, give step-by-step instructions without writing the code. When he gets stuck or asks you to write something, write it. Always check the actual files before advising — don't assume state from memory.

When Hridayesh says "time to commit", "let's commit", or anything similar, update this CLAUDE.md file first — move completed items from "What's Next" to "What's Built", and accurately reflect the current state of the codebase. Then remind him to stage, commit, and push.

---

## Tech Stack

- **React + Vite** — component-based frontend
- **React Router DOM** — client-side routing
- **Lucide React** — icons
- **Vanilla CSS** with CSS custom properties (no Tailwind, no CSS-in-JS)
- **Supabase** — integrated for DB (`src/lib/supabase.js`, credentials in `.env`). Auth still planned.
- **Claude/OpenAI API** — planned for AI assistant (not yet integrated)

---

## Design System

Dark minimalist. These CSS variables are defined in `src/index.css` and used everywhere:

```css
--bg: #0a0a0a
--surface: #141414
--surface2: #1c1c1c
--border: #2a2a2a
--text: #f5f5f5
--text-muted: #525252
--accent: #4ade80
```

Sidebar nav uses `#0ea5e9` (blue) for active state and hover. Event/accent colors: `#4ade80` green, `#60a5fa` blue, `#f87171` red, `#a78bfa` purple, `#fb923c` orange.

---

## File Structure

```
src/
  index.css           # Global reset + CSS variables
  main.jsx            # React entry point
  App.jsx             # Router setup + layout shell
  App.css             # .app-layout (flex row), .main-content (flex 1, padding 24px)
  lib/
    supabase.js       # createClient from VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
  components/
    Navbar.jsx        # Sidebar nav with Lucide icons + React Router Links
    Navbar.css
    AddEventModal.jsx # Modal form for creating new events
    AddEventModal.css
    EventModal.jsx    # Modal for viewing + editing existing events (view/edit mode toggle)
    EventModal.css
    AddHabitModal.jsx # Modal for creating habits
    AddHabitModal.css
    AddGoalModal.jsx  # Modal for creating goals
    AddGoalModal.css
    AddMealModal.jsx  # Modal for logging meals
    AddMealModal.css
    EditTargetsModal.jsx # Modal for editing daily calorie/protein targets
    EditTargetsModal.css
    AddListModal.jsx  # Modal for creating bucket lists
    AddListModal.css
    AddSkillModal.jsx # Modal for adding skills (name, category, parent)
    AddSkillModal.css
  pages/
    Home.jsx          # Dashboard — hardcoded stats, schedule, goals, AI tip (all static for now)
    Home.css
    Timetable.jsx     # Weekly calendar grid — DONE (see below)
    Timetable.css
    Habits.jsx        # DONE (see below)
    Goals.jsx         # DONE (see below)
    BucketList.jsx    # DONE (see below)
    SkillTree.jsx     # DONE (see below)
    Fitness.jsx       # DONE (see below)
    Assistant.jsx     # Stub
```

---

## Routes

| Path | Component |
|------|-----------|
| `/` | Home |
| `/timetable` | Timetable |
| `/habits` | Habits |
| `/goals` | Goals |
| `/bucketlist` | BucketList |
| `/skilltree` | SkillTree |
| `/fitness` | Fitness |
| `/assistant` | Assistant |

---

## What's Built

### Navbar (done)
Sidebar, 260px wide. Maps `navItems` array to `<Link>` elements. Uses `useLocation()` to apply `.active` class. Responsive: collapses to top bar on mobile (`max-width: 900px`). Bottom has user avatar chip.

### Home (done — static)
Header row, stats row (Today's Events / Habits / Streak), bottom row with Today's Schedule timeline + Goals progress bars + AI Tip card. All data is hardcoded. Will be wired to real data once other pages are built.

### Timetable (done)

**State in `Timetable.jsx`:**
- `events` — array of event objects (initialized from `MOCK_EVENTS`)
- `weekOffset` — integer, week navigation (0 = current week)
- `showModal` — boolean, controls AddEventModal
- `selectedEvent` — event object or null, controls EventModal

**Event data shape:**
```js
{
  id: number,         // Date.now() for new events
  title: string,
  day: number,        // 0=Sun, 1=Mon, ... 6=Sat
  startHour: number,
  startMin: number,
  endHour: number,
  endMin: number,
  color: string,      // hex color
  description: string // optional, can be empty
}
```

**Grid mechanics:**
- `START_HOUR = 6`, `END_HOUR = 23`, `HOUR_HEIGHT = 64` (px per hour)
- Event `top` = `(startHour - START_HOUR) * HOUR_HEIGHT + (startMin / 60) * HOUR_HEIGHT`
- Event `height` = `duration * HOUR_HEIGHT - 4`
- Day columns use `position: relative`, event cards use `position: absolute`

**AddEventModal:** Form with title, day select, start/end time (hour + min), color picker (5 dots), description textarea. Validates end > start before submitting.

**EventModal:** Two modes — `view` (shows title, day, time, duration, description with a divider) and `edit` (same fields as AddEventModal, pre-filled). Top bar has color chip + pencil icon (→ edit) + trash icon (delete) + X (close). Clicking overlay closes.

### Habits (done)

Fully wired to Supabase (`habits` + `habit_completions`). Habit cards render with color bar, name, frequency, streak count, and a custom green checkbox. Checking the box inserts/deletes a row in `habit_completions` for today. Add Habit modal (`AddHabitModal`) inserts a habit. Streak is calculated from `completedDates`, not stored.

**Habit data shape:**
```js
{
  id: number,
  name: string,
  frequency: 'daily' | 'weekdays' | 'weekly',
  color: string,
  completedDates: string[], // 'YYYY-MM-DD' strings, e.g. '2026-06-19'
}
```

### Goals (done)

Wired to Supabase (`goals` + `goal_tasks`, loaded via `select('*, goal_tasks(*)')`). Each goal card has a color bar, title, optional description, a live progress bar + percentage (done/total sub-tasks), and a delete button. Sub-tasks render with a custom checkbox (toggles `goal_tasks.done`), per-task delete, and an inline "add sub-task" form. `AddGoalModal` (title, description, color) creates goals. Uses `dbToGoal` / `goalToDb`.

### Fitness (done)

Wired to Supabase (`meals` + `fitness_targets`). Loads today's meals (`logged_on = today`) and the first targets row (creates one on first save if none exists). Targets card shows calorie + protein progress bars (today's totals vs target) plus a carbs/fat summary; `EditTargetsModal` edits the targets. Meal log lists each meal with macros + calories and a delete button. `AddMealModal` logs a meal (name, calories, protein/carbs/fat). Uses `dbToMeal` / `mealToDb`.

### Bucket List (done)

Wired to Supabase (`bucket_lists` + `bucket_items`, loaded via `select('*, bucket_items(*)')`). Each list card has a color bar, name, done/total count, a progress bar, per-item checkboxes (toggle `bucket_items.done`), inline "add item" form, and delete buttons for both items and the whole list. `AddListModal` (name, color) creates lists. Uses `dbToList` / `listToDb`.

### Skill Tree (done)

Wired to Supabase (`skills`). Renders a pure-CSS org-chart tree from `parent_id` (recursive `renderNode`, ul/li connectors in `SkillTree.css`). Nodes show a lock/check badge, name, and category (category drives the accent color). Clicking an available locked node unlocks it; clicking an unlocked node re-locks it and cascade-locks descendants. A node is "blocked" (dimmed, not clickable) until its parent is unlocked. Per-node delete (children fall back to roots via `ON DELETE SET NULL`). `AddSkillModal` (name, category with datalist, parent select) adds skills. Uses `dbToSkill` / `skillToDb`.

---

## What's Next (planned order)

1. **Habits** — remaining nice-to-haves: delete habit, edit habit (toggle + streak + add already done)
2. **Goals** — optional: link sub-tasks to habits/timetable; edit goal
3. **Timetable** — remaining nice-to-haves: recurring events toggle in AddEventModal, month view (lower priority — AI assistant will handle recurring events)
4. **Home dashboard** — replace hardcoded stats/schedule/goals with real Supabase data now that the pages exist
5. **AI Assistant** — Claude/OpenAI API with tool use:
   - `get_schedule()`, `add_event()`, `get_habits()`, `get_goals()`, `suggest_time_slot()`
   - **Event prediction** — AI predicts likely upcoming events from patterns
   - **Recurring event generation** — user describes a routine (e.g. "PPL gym split, Mon/Wed/Fri/Sat") and AI bulk-creates events with titles + descriptions auto-filled
   - Daily check-ins, learns preferences over time
6. **Auth** — Supabase auth added last once core features stable (then set `user_id` on all inserts; tables already have the nullable column)

---

## Conventions

- One CSS file per component/page, co-located (e.g. `Navbar.jsx` + `Navbar.css`)
- CSS classes use kebab-case, scoped by component prefix (e.g. `.event-modal-topbar`)
- No inline styles except dynamic values (colors, calculated positions)
- `updateField(key, value)` / `set(key, value)` pattern for form state updates
- Event handlers named `handleSubmit`, `handleSave` etc.
- Mock data stays in the same file as the component until Supabase replaces it
- Keep components self-contained — no global state yet
