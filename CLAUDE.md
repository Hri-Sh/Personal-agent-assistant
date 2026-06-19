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
- **Supabase** — planned for DB + auth (not yet integrated)
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
  components/
    Navbar.jsx        # Sidebar nav with Lucide icons + React Router Links
    Navbar.css
    AddEventModal.jsx # Modal form for creating new events
    AddEventModal.css
    EventModal.jsx    # Modal for viewing + editing existing events (view/edit mode toggle)
    EventModal.css
  pages/
    Home.jsx          # Dashboard — hardcoded stats, schedule, goals, AI tip (all static for now)
    Home.css
    Timetable.jsx     # Weekly calendar grid — DONE (see below)
    Timetable.css
    Habits.jsx        # Stub
    Goals.jsx         # Stub
    BucketList.jsx    # Stub
    SkillTree.jsx     # Stub
    Fitness.jsx       # Stub
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

### Habits (in progress)

Static layout done — habit cards render from `MOCK_HABITS` with color bar, name, frequency, streak count, and checkbox. Checkbox is custom styled (green checkmark on tick). No interactivity yet — checkbox toggle, streak calculation, and Add Habit modal are next.

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
Streak is calculated from `completedDates`, not stored.

---

## What's Next (planned order)

1. **Habits page** — checkbox toggle, streak calculation, Add Habit modal, delete habit (static layout already done)
2. **Timetable** — remaining nice-to-haves: recurring events toggle in AddEventModal, month view (lower priority — AI assistant will handle recurring events)
3. **Goals page** — create goals with sub-tasks, progress bars, link to habits/timetable
4. **Fitness page** — log meals/calories, daily targets, nutrition breakdown
5. **Bucket List** — multiple named lists, items, progress bars per list and item
6. **Skill Tree** — visual node tree, unlock on completion, categories
7. **AI Assistant** — Claude/OpenAI API with tool use:
   - `get_schedule()`, `add_event()`, `get_habits()`, `get_goals()`, `suggest_time_slot()`
   - **Event prediction** — AI predicts likely upcoming events from patterns
   - **Recurring event generation** — user describes a routine (e.g. "PPL gym split, Mon/Wed/Fri/Sat") and AI bulk-creates events with titles + descriptions auto-filled
   - Daily check-ins, learns preferences over time
8. **Auth** — Supabase auth added last once core features stable
9. **Supabase integration** — replace all mock/local state with real DB throughout

---

## Conventions

- One CSS file per component/page, co-located (e.g. `Navbar.jsx` + `Navbar.css`)
- CSS classes use kebab-case, scoped by component prefix (e.g. `.event-modal-topbar`)
- No inline styles except dynamic values (colors, calculated positions)
- `updateField(key, value)` / `set(key, value)` pattern for form state updates
- Event handlers named `handleSubmit`, `handleSave` etc.
- Mock data stays in the same file as the component until Supabase replaces it
- Keep components self-contained — no global state yet
