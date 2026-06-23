import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { House, CalendarDays, CheckCircle, Target, ListChecks, GitBranch, Activity, BarChart3, Bot } from 'lucide-react'
import './Navbar.css'
import { supabase } from '../lib/supabase'

const navItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/habits', label: 'Habits', icon: CheckCircle },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/bucketlist', label: 'Bucket List', icon: ListChecks },
  { to: '/skilltree', label: 'Skill Tree', icon: GitBranch },
  { to: '/fitness', label: 'Fitness', icon: Activity },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
]

// XP weights per action
const XP = { completion: 10, task: 15, skill: 50, workout: 20 }

function levelFromXp(xp) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1
  const curBase = Math.pow(level - 1, 2) * 100
  const nextBase = Math.pow(level, 2) * 100
  const pct = nextBase > curBase
    ? Math.round(((xp - curBase) / (nextBase - curBase)) * 100)
    : 0
  return { level, pct, toNext: nextBase - xp }
}

function Navbar() {
  const location = useLocation()
  const [xp, setXp] = useState(0)

  // Aggregate XP from across the app (self-contained — no global state)
  useEffect(() => {
    const head = { count: 'exact', head: true }
    Promise.all([
      supabase.from('habit_completions').select('*', head),
      supabase.from('goal_tasks').select('*', head).eq('done', true),
      supabase.from('skills').select('*', head).eq('unlocked', true),
      supabase.from('workouts').select('*', head),
    ]).then(([comp, tasks, skills, workouts]) => {
      const total =
        (comp.count ?? 0) * XP.completion +
        (tasks.count ?? 0) * XP.task +
        (skills.count ?? 0) * XP.skill +
        (workouts.count ?? 0) * XP.workout
      setXp(total)
    }).catch(() => {})
  }, [location.pathname]) // refresh when navigating between pages

  const { level, pct } = levelFromXp(xp)

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h1>L.I.F.E</h1>
        <p>Personal Assistant</p>
      </div>

      <div className="sidebar-links">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">H</div>
        <div className="sidebar-user-info">
          <div className="user-name-row">
            <p>Hridayesh</p>
            <span className="user-level">Lvl {level}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill fill-animated" style={{ width: `${pct}%` }} />
          </div>
          <small className="xp-text">{xp} XP</small>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
