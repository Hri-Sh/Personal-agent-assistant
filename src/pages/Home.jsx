import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import './Home.css'
import { supabase } from '../lib/supabase'
import CountUp from '../components/CountUp'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatTime(hour, min) {
  const h = hour % 12 === 0 ? 12 : hour % 12
  const suffix = hour < 12 || hour === 24 ? 'am' : 'pm'
  const m = min > 0 ? `:${String(min).padStart(2, '0')}` : ''
  return `${h}${m}${suffix}`
}

function calcStreak(completedDates) {
  let streak = 0
  const d = new Date()
  while (true) {
    const dateStr = d.toLocaleDateString('en-CA')
    if (completedDates.includes(dateStr)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}

export default function Home() {
  const today = new Date().toLocaleDateString('en-CA')
  const todayDow = new Date().getDay()

  const [events, setEvents] = useState([])
  const [habits, setHabits] = useState([])
  const [goals, setGoals] = useState([])

  useEffect(() => {
    supabase.from('events').select('*').then(({ data, error }) => {
      if (!error && data) setEvents(data)
    })
    supabase.from('habits').select('*, habit_completions(completed_on)').then(({ data, error }) => {
      if (!error && data) setHabits(data)
    })
    supabase.from('goals').select('*, goal_tasks(*)').then(({ data, error }) => {
      if (!error && data) setGoals(data)
    })
  }, [])

  // Today's schedule
  const todaysEvents = events
    .filter(e => e.day === todayDow)
    .sort((a, b) => (a.start_hour * 60 + a.start_min) - (b.start_hour * 60 + b.start_min))

  // Habit completion today
  const habitStatus = habits.map(h => ({
    ...h,
    dates: (h.habit_completions ?? []).map(c => c.completed_on),
  }))
  const habitsDone = habitStatus.filter(h => h.dates.includes(today)).length
  const habitsTotal = habitStatus.length
  const completionPct = habitsTotal === 0 ? 0 : Math.round((habitsDone / habitsTotal) * 100)
  const bestStreak = habitStatus.reduce((max, h) => Math.max(max, calcStreak(h.dates)), 0)

  // Goals with progress
  const goalProgress = goals.map(g => {
    const tasks = g.goal_tasks ?? []
    const done = tasks.filter(t => t.done).length
    const pct = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100)
    return { id: g.id, title: g.title, color: g.color, pct }
  })

  // Animated ring geometry
  const R = 34
  const C = 2 * Math.PI * R
  const ringOffset = C * (1 - completionPct / 100)

  return (
    <div className="home-page page-enter">
      <div className="home-header">
        <div>
          <h1>{greeting()}, Hridayesh</h1>
          <span className="home-sub">
            {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <Link to="/timetable" className="quick-add-btn press">
          <Plus size={16} /> Quick Add
        </Link>
      </div>

      <div className="home-stats">
        <Link to="/timetable" className="stat-card stagger-item" style={{ '--i': 0 }}>
          <span className="stat-label">Today's Events</span>
          <CountUp className="stat-value" value={todaysEvents.length} />
        </Link>

        <Link to="/habits" className="stat-card habits-stat stagger-item" style={{ '--i': 1 }}>
          <div className="ring-wrap">
            <svg viewBox="0 0 80 80" className="habit-ring">
              <circle cx="40" cy="40" r={R} className="ring-track" />
              <circle
                cx="40" cy="40" r={R}
                className="ring-progress"
                style={{ strokeDasharray: C, strokeDashoffset: ringOffset }}
              />
            </svg>
            <span className="ring-text">{habitsDone}/{habitsTotal}</span>
          </div>
          <span className="stat-label">Habits done</span>
        </Link>

        <Link to="/habits" className="stat-card stagger-item" style={{ '--i': 2 }}>
          <span className="stat-label">Best Streak</span>
          <span className="stat-value">
            🔥 <CountUp value={bestStreak} /> <small>days</small>
          </span>
        </Link>
      </div>

      <div className="home-bottom">
        <div className="home-panel stagger-item" style={{ '--i': 3 }}>
          <span className="section-label">Today's Schedule</span>
          {todaysEvents.length === 0 ? (
            <p className="panel-empty">Nothing scheduled for {DAYS[todayDow]}. Enjoy the free day!</p>
          ) : (
            <div className="schedule-list">
              {todaysEvents.map((e, i) => (
                <div key={e.id} className="schedule-item stagger-item" style={{ '--i': i }}>
                  <span className="schedule-time">{formatTime(e.start_hour, e.start_min)}</span>
                  <div
                    className="schedule-bar"
                    style={{ borderColor: e.color, background: `${e.color}1a`, color: e.color }}
                  >
                    {e.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="home-panel stagger-item" style={{ '--i': 4 }}>
          <span className="section-label">Goals</span>
          {goalProgress.length === 0 ? (
            <p className="panel-empty">No goals yet.</p>
          ) : (
            <div className="goal-progress-list">
              {goalProgress.slice(0, 4).map(g => (
                <div key={g.id} className="home-goal">
                  <div className="home-goal-head">
                    <span>{g.title}</span>
                    <span>{g.pct}%</span>
                  </div>
                  <div className="home-progress-bar">
                    <div
                      className="home-progress-fill fill-animated"
                      style={{ width: `${g.pct}%`, background: g.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
