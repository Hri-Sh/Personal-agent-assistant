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
- **Supabase** — integrated for DB (`src/lib/supabase.js`, credentials in `.env`). Auth still planned. Incremental SQL migrations live in `migrations/` (run manually in the Supabase SQL editor; `schema.sql` stays the full-schema source of truth).
- **Claude/OpenAI API** — planned for AI assistant (not yet integrated)
- **Animations** — pure CSS keyframes in `src/styles/animations.css` (imported in `main.jsx`) + a tiny dependency-free canvas confetti engine in `src/lib/confetti.js`. No animation libraries. Honors `prefers-reduced-motion`.

---

## Design System

Dark, with a stronger visual identity (layered surfaces, subtle gradients + glow, real type). Tokens live in `src/index.css`:

```css
/* surfaces (layered for depth) */
--bg: #08090c
--surface: #121317
--surface-2: #191b20   /* --surface2 kept as a legacy alias */
--surface-3: #22252b
--border: #262a31
--border-strong: #363b44
/* text */
--text: #f4f6f9
--text-muted: #8b929c  /* lightened for contrast */
--text-dim: #5b616b
/* accents + gradients */
--accent: #4ade80
--accent-2: #22d3ee
--accent-blue: #0ea5e9
--accent-ink: #04140a               /* dark text on accent fills */
--accent-grad: linear-gradient(135deg, #4ade80, #22d3ee)
/* radii / shadows / glow */
--radius-sm/​--radius/​--radius-lg, --shadow-1/​--shadow-2, --glow-accent
```

**Fonts** (loaded from Google Fonts in `index.css`): `--font` = Inter (body), `--font-display` = Space Grotesk (headings + big numbers; `h1/h2/h3` use it globally). The body has a subtle two-tone radial-gradient background.

Primary "add" buttons use `--accent-grad` with `--accent-ink` text + `--glow-accent`. Sidebar active item is a gradient pill with an accent marker. Event/accent colors: `#4ade80` green, `#60a5fa` blue, `#f87171` red, `#a78bfa` purple, `#fb923c` orange.

---

## File Structure

```
src/
  index.css           # Global reset + CSS variables
  main.jsx            # React entry point
  App.jsx             # Router setup + layout shell
  App.css             # .app-layout (flex row), .main-content (flex 1, padding 24px)
  styles/
    animations.css    # Shared keyframes + utility classes (page-enter, stagger-item, press, fill-animated, etc.)
  lib/
    supabase.js       # createClient from VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
    confetti.js       # Dependency-free canvas confetti — fireConfetti({ origin, count, ... })
    muscles.js        # MUSCLE_GROUPS, muscleLabel(), WORKOUT_PRESETS + recovery model (RECOVERY_STAGES, recoveryFor(), timeAgo()) shared by Fitness + BodyMap
  components/
    Navbar.jsx        # Sidebar nav + XP/level bar (aggregates XP from Supabase counts)
    Navbar.css
    CountUp.jsx       # Animated count-up number (used on Home)
    BodyMap.jsx       # Anatomical front/back muscle map (bezier paths, mirrored halves): solid silhouette, outlined muscles colored by recovery state, legend + per-muscle "last trained x ago" list
    BodyMap.css
    AddWorkoutModal.jsx # Modal for logging a workout (name + muscle-group chips + presets)
    AddWorkoutModal.css
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
    SkillModal.jsx    # One modal for BOTH adding + editing skills (name, custom category, parent, color picker)
    SkillModal.css
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
    Insights.jsx      # DONE (see below)
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
| `/insights` | Insights |
| `/assistant` | Assistant |

---

## What's Built

### Navbar (done)
Sidebar, 260px wide. Maps `navItems` array to `<Link>` elements. Uses `useLocation()` to apply `.active` class. Responsive: collapses to top bar on mobile (`max-width: 900px`). Bottom has user avatar chip.

### Home (done — live)
Wired to Supabase. Time-based greeting, three stat cards (today's real events count, an animated SVG habit-completion ring showing done/total, best current streak across habits via `CountUp`), and a bottom row with today's real schedule (events filtered to today's weekday, colored bars) + live goal progress bars. Stat cards link to their pages. Fully animated (page-enter, stagger, ring fill, count-up).

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

Wired to Supabase (`meals` + `fitness_targets` + `workouts`).

**Nutrition:** loads today's meals (`logged_on = today`) and the first targets row (creates one on first save if none exists). Targets card shows calorie + protein progress bars (today's totals vs target) plus a carbs/fat summary; `EditTargetsModal` edits the targets. Meal log lists each meal with macros + calories and a delete button. `AddMealModal` logs a meal. Uses `dbToMeal` / `mealToDb`.

**Training / muscle recovery map:** loads the last 30 days of `workouts` and computes each muscle's most recent training timestamp (from `created_at`); the workout log below still displays only the last 7 days. `BodyMap` renders workout-tracker-style anatomical front/back figures: solid dark silhouette (incl. hands/feet), muscles as bold black-outlined bezier shapes (symmetric ones authored once and mirrored, midline ones centered) filled by **recovery state** — red "Just trained" (<24h, breathing glow) → orange "Recovering" (24–60h) → green "Rested" (60h+), never-trained = dark — plus anatomy seam lines (ab rows, sternum, spine, quad/ham seams), a legend, and a two-column per-muscle "last trained x ago" list (fresh dots pulse; times tick every minute via a `now` state in Fitness). Recovery logic lives in `src/lib/muscles.js`. `AddWorkoutModal` logs a workout (name + muscle-group chips, with Push/Pull/Legs/etc. presets). Logging a workout fires confetti.

### Bucket List (done)

Wired to Supabase (`bucket_lists` + `bucket_items`, loaded via `select('*, bucket_items(*)')`). Each list card has a color bar, name, done/total count, a progress bar, per-item checkboxes (toggle `bucket_items.done`), inline "add item" form, and delete buttons for both items and the whole list. `AddListModal` (name, color) creates lists. Uses `dbToList` / `listToDb`.

### Skill Tree (done)

Wired to Supabase (`skills`, now including a per-skill `color` column — see `migrations/2026-07-03_add_skill_color.sql`). Recursive `renderNode` lays nodes out with flex (ul/li for positioning only). Connectors are drawn as **glowing SVG bezier branches** in an overlay `<svg>`: node positions are measured via refs + `useLayoutEffect` (recomputed on resize), and each parent→child path is built as a cubic curve. Branches whose parent is unlocked take the **child skill's color**, glow, and animate a draw-in (`stroke-dashoffset`). Nodes show a lock/check badge, name, and category, and glow in `skill.color` when unlocked (legacy category→color mapping kept only as a fallback for old rows). Clicking an available locked node unlocks it (confetti + pulse); clicking an unlocked node re-locks it and cascade-locks descendants. "Blocked" nodes are dimmed until their parent unlocks.

**Add/edit UX:** right-clicking a node (or its hover kebab button) opens an animated context menu — Edit skill / Add child node / Lock–Unlock (disabled while blocked) / Delete. Menu closes on click, right-click elsewhere, Esc, scroll, or resize; position is clamped to the viewport. Both add and edit go through the single `SkillModal` (name, free-text category whose datalist includes every category already in use so custom "directories" persist, parent select — edit mode excludes self + descendants to prevent cycles — and a color picker: 5 preset dots + a rainbow custom swatch wrapping `<input type="color">`). Deleting falls back children to roots via `ON DELETE SET NULL`. Uses `dbToSkill` / `skillToDb` (both include `color`). The context menu markup/styles live in `SkillTree.jsx`/`.css` (page-scoped); `MENU_WIDTH` in JSX must stay in sync with `.skill-menu` width in CSS.

### Insights (done)

New analytics page wired to Supabase. Three pure-SVG/CSS visualizations (no chart library): a GitHub-style **habit heatmap** (last ~90 days of `habit_completions`, 5 intensity levels), a **calorie bar chart** (last 14 days of `meals`, animated grow-in with avg), a **protein sparkline** (SVG area+line), and a **goal-completion donut** (overall `goal_tasks` done/total). Everything animates on entrance.

### Animations & celebrations (done)

`src/styles/animations.css` defines shared keyframes + utility classes used everywhere: `page-enter`, `stagger-item` (with `--i` index for delay), `press`, `fill-animated`, `pop-in`, `check-pop`, `glow-pulse`, `draw-line`, plus (UX refresh v2) `aurora-a`/`aurora-b`, `gradient-pan`, `sheen-sweep`, `.text-grad-animated`, `.sheen`. Modals pop in. `src/lib/confetti.js` is a self-contained canvas confetti — `fireConfetti({ origin, count, colors, ... })` — fired on habit completion (full-clear = big burst), goal/bucket-list completion, skill unlock, and workout logging. All respects `prefers-reduced-motion`.

**IMPORTANT — fill-mode rule:** entrance animations must use `animation-fill-mode: backwards`, never `forwards`/`both`. A filled-forward `transform` permanently overrides hover transforms on the same element and turns the animated wrapper into a containing block that breaks `position: fixed` children (modals, context menus). This bug was fixed once already — don't reintroduce it.

### UI/UX refresh v2 (done)

App-wide motion pass, all vanilla CSS: ambient aurora (two blurred drifting color blobs via `body::before/::after` in `index.css`), animated gradient text on the sidebar logo and Home greeting, XP-bar light sweep, staggered sidebar entrance + hover slide, stat-card sheen sweep/glow lift, color bars on habit/goal/bucket cards stretch + glow on hover, sub-task row hover highlights, progress bars ease over 0.7s, timetable event cards pop in and lift, Insights sparkline draw-in + heatmap cell pop + glowing donut, skill nodes fade in and glow in their own color, springy color-picker dots, and a global `:focus-visible` ring.

### XP & levels (done)

`Navbar` aggregates XP from Supabase counts (habit completions ×10, done goal-tasks ×15, unlocked skills ×50, workouts ×20), computes a level (`level = floor(sqrt(xp/100)) + 1`), and shows an animated XP bar + level badge in the user chip. Re-fetches on route change. Self-contained (no global state).

---

## What's Next (planned order)

1. **Habits** — remaining nice-to-haves: delete habit, edit habit (toggle + streak + add already done)
2. **Goals** — optional: link sub-tasks to habits/timetable; edit goal
3. **Timetable** — remaining nice-to-haves: recurring events toggle in AddEventModal, month view (lower priority — AI assistant will handle recurring events)
4. **AI Assistant** — Claude/OpenAI API with tool use:
   - `get_schedule()`, `add_event()`, `get_habits()`, `get_goals()`, `suggest_time_slot()`
   - **Event prediction** — AI predicts likely upcoming events from patterns
   - **Recurring event generation** — user describes a routine (e.g. "PPL gym split, Mon/Wed/Fri/Sat") and AI bulk-creates events with titles + descriptions auto-filled
   - Daily check-ins, learns preferences over time
5. **Auth** — Supabase auth added last once core features stable (then set `user_id` on all inserts; tables already have the nullable column)

---

## Conventions

- One CSS file per component/page, co-located (e.g. `Navbar.jsx` + `Navbar.css`)
- CSS classes use kebab-case, scoped by component prefix (e.g. `.event-modal-topbar`)
- No inline styles except dynamic values (colors, calculated positions)
- `updateField(key, value)` / `set(key, value)` pattern for form state updates
- Event handlers named `handleSubmit`, `handleSave` etc.
- Mock data stays in the same file as the component until Supabase replaces it
- Keep components self-contained — no global state yet
