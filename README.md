# L.I.F.E — Life Intelligence & Fitness Engine

A personal life OS in one dark, minimalist web app: your timetable, habits, goals, fitness, skills, and analytics, all wired to a real database and sprinkled with satisfying animations.

Built with React + Vite and Supabase. No UI framework, no animation library — the visuals (confetti, the muscle map, the skill tree, every chart) are hand-rolled.

> **Status:** active personal project / learning build. Core features are done; an AI assistant and auth are planned.

---

## ✨ Features

- **Home dashboard** — a live snapshot of your day: today's events, an animated habit-completion ring, current streaks, and goal progress, all pulled straight from the database.
- **Timetable** — a weekly calendar grid. Create, edit, and delete events with colors, times, and descriptions.
- **Habits** — daily/weekday/weekly habits with one-tap completion, automatic streak tracking, and a confetti burst when you clear them all for the day.
- **Goals** — goals broken into sub-tasks with live progress bars; finishing a goal triggers a celebration.
- **Bucket List** — multiple named lists with checkable items and per-list progress.
- **Skill Tree** — an interactive tree of skills connected by glowing, self-drawing SVG branches. Unlock nodes to light up their paths (with confetti); locked branches stay dim until their prerequisite is unlocked.
- **Fitness** — log meals with full macros against daily calorie/protein targets, **plus** a workout log that powers an interactive **body muscle map** — muscles light up brighter the more you train them over the last 7 days.
- **Insights** — analytics built from pure SVG/CSS: a GitHub-style habit heatmap, a 14-day calorie chart, a protein sparkline, and a goal-completion donut.
- **XP & levels** — earn XP across the whole app (habits, tasks, skills, workouts) and watch your level bar fill in the sidebar.
- **Motion everywhere** — page transitions, staggered card entrances, animated progress fills, and celebratory confetti. All of it respects `prefers-reduced-motion`.

---

## 🛠 Tech Stack

- **React 19 + Vite** — component-based frontend with fast HMR
- **React Router** — client-side routing
- **Supabase** — Postgres database (auth planned)
- **Lucide React** — icons
- **Vanilla CSS** with custom properties — no Tailwind, no CSS-in-JS
- **Custom animation layer** — pure CSS keyframes + a dependency-free canvas confetti engine

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Hri-Sh/Personal-agent-assistant.git
cd Personal-agent-assistant
npm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then in the project's **SQL Editor**:

1. Run [`schema.sql`](./schema.sql) to create all the tables.
2. (Optional) Run [`seed.sql`](./seed.sql) to load a full demo dataset so every page looks alive. ⚠️ It wipes the listed tables first — remove the `TRUNCATE` line if you'd rather keep existing data.

### 3. Add your credentials

Create a `.env` file in the project root (it's gitignored):

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You'll find both under **Project Settings → API** in Supabase.

### 4. Run it

```bash
npm run dev
```

Open the printed local URL and you're in.

---

## 📁 Project Structure

```
src/
  main.jsx              # entry point (imports global + animation styles)
  App.jsx               # router + layout shell
  index.css             # CSS reset + design tokens (colors, etc.)
  styles/
    animations.css      # shared keyframes + utility classes
  lib/
    supabase.js         # Supabase client
    confetti.js         # dependency-free canvas confetti
    muscles.js          # muscle groups + workout presets
  components/
    Navbar.jsx          # sidebar nav + XP/level bar
    BodyMap.jsx         # front/back muscle map SVG
    CountUp.jsx         # animated count-up number
    *Modal.jsx          # add/edit modals for each feature
  pages/
    Home, Timetable, Habits, Goals, BucketList,
    SkillTree, Fitness, Insights, Assistant
```

Convention: one co-located CSS file per component/page, kebab-case classes scoped by a component prefix.

---

## 📜 Available Scripts

```bash
npm run dev       # start the dev server
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint      # run ESLint
```

---

## 🗺 Roadmap

- [ ] **AI Assistant** — natural-language scheduling, recurring-event generation, and daily check-ins (Claude/OpenAI with tool use)
- [ ] **Auth** — Supabase auth so the app is multi-user (tables already carry a nullable `user_id`)
- [ ] Habit editing, goal/timetable linking, recurring events, month view

---

## 📝 Notes

- There's no auth yet — the app currently reads/writes a single shared dataset. Add Supabase auth before deploying anywhere public.
- Everything visual is built from scratch (SVG/CSS/canvas) rather than pulled from a chart or animation library, partly as a learning exercise.

---

Built by [Hridayesh](https://github.com/Hri-Sh) 
