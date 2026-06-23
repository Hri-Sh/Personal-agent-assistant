import { useState, useEffect } from 'react'
import './Insights.css'
import { supabase } from '../lib/supabase'

const DAY_MS = 86400000

function isoDate(d) {
  return d.toLocaleDateString('en-CA')
}

// Build an array of the last `n` Date objects ending today (oldest first)
function lastNDays(n) {
  const out = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(today.getTime() - i * DAY_MS))
  }
  return out
}

function heatLevel(count) {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

export default function Insights() {
  const [completions, setCompletions] = useState([])
  const [meals, setMeals] = useState([])
  const [goals, setGoals] = useState([])

  useEffect(() => {
    const since14 = isoDate(new Date(Date.now() - 13 * DAY_MS))
    const since95 = isoDate(new Date(Date.now() - 95 * DAY_MS))

    supabase.from('habit_completions').select('completed_on').gte('completed_on', since95)
      .then(({ data, error }) => { if (!error && data) setCompletions(data) })
    supabase.from('meals').select('calories, protein_g, logged_on').gte('logged_on', since14)
      .then(({ data, error }) => { if (!error && data) setMeals(data) })
    supabase.from('goals').select('*, goal_tasks(done)')
      .then(({ data, error }) => { if (!error && data) setGoals(data) })
  }, [])

  /* ── Habit heatmap (last 13 weeks) ── */
  const completionCounts = {}
  for (const c of completions) {
    completionCounts[c.completed_on] = (completionCounts[c.completed_on] ?? 0) + 1
  }
  // Align the grid to whole weeks: back up to the Sunday on/before 90 days ago
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 90)
  start.setDate(start.getDate() - start.getDay()) // to Sunday
  const today0 = new Date()
  today0.setHours(0, 0, 0, 0)
  const heatDays = []
  for (let d = new Date(start); d <= today0; d.setDate(d.getDate() + 1)) {
    const key = isoDate(d)
    heatDays.push({ key, count: completionCounts[key] ?? 0 })
  }
  const totalCompletions = completions.length

  /* ── Calorie / protein trend (last 14 days) ── */
  const days14 = lastNDays(14)
  const calByDay = {}
  const protByDay = {}
  for (const m of meals) {
    calByDay[m.logged_on] = (calByDay[m.logged_on] ?? 0) + m.calories
    protByDay[m.logged_on] = (protByDay[m.logged_on] ?? 0) + (m.protein_g ?? 0)
  }
  const calData = days14.map(d => calByDay[isoDate(d)] ?? 0)
  const protData = days14.map(d => protByDay[isoDate(d)] ?? 0)
  const calMax = Math.max(1, ...calData)
  const protMax = Math.max(1, ...protData)
  const calAvg = Math.round(calData.reduce((a, b) => a + b, 0) / calData.length)

  // Protein sparkline geometry
  const SW = 520, SH = 90
  const protPoints = protData.map((v, i) => {
    const x = (i / (protData.length - 1)) * SW
    const y = SH - (v / protMax) * (SH - 8) - 4
    return [x, y]
  })
  const protLine = protPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const protArea = `${protLine} L ${SW} ${SH} L 0 ${SH} Z`

  /* ── Goal completion donut ── */
  let totalTasks = 0, doneTasks = 0
  for (const g of goals) {
    const tasks = g.goal_tasks ?? []
    totalTasks += tasks.length
    doneTasks += tasks.filter(t => t.done).length
  }
  const goalPct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
  const DR = 52
  const DC = 2 * Math.PI * DR
  const donutOffset = DC * (1 - goalPct / 100)

  return (
    <div className="insights-page page-enter">
      <div className="insights-header">
        <h2>Insights</h2>
        <span className="insights-sub">Your last few months at a glance</span>
      </div>

      {/* Habit heatmap */}
      <div className="insight-card stagger-item" style={{ '--i': 0 }}>
        <div className="insight-card-head">
          <span className="section-label">Habit consistency</span>
          <span className="insight-meta">{totalCompletions} completions · 90 days</span>
        </div>
        <div className="heatmap">
          {heatDays.map(d => (
            <div
              key={d.key}
              className={`heat-cell level-${heatLevel(d.count)}`}
              title={`${d.key}: ${d.count} ${d.count === 1 ? 'habit' : 'habits'}`}
            />
          ))}
        </div>
        <div className="heat-legend">
          <span>Less</span>
          <div className="heat-cell level-0" />
          <div className="heat-cell level-1" />
          <div className="heat-cell level-2" />
          <div className="heat-cell level-3" />
          <div className="heat-cell level-4" />
          <span>More</span>
        </div>
      </div>

      {/* Calorie bars */}
      <div className="insight-card stagger-item" style={{ '--i': 1 }}>
        <div className="insight-card-head">
          <span className="section-label">Calories · last 14 days</span>
          <span className="insight-meta">avg {calAvg} kcal</span>
        </div>
        <div className="cal-bars">
          {calData.map((v, i) => (
            <div className="cal-bar-col" key={i}>
              <div
                className="cal-bar"
                style={{ height: `${(v / calMax) * 100}%`, animationDelay: `${i * 35}ms` }}
                title={`${isoDate(days14[i])}: ${v} kcal`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Protein sparkline + goal donut */}
      <div className="insights-row">
        <div className="insight-card stagger-item" style={{ '--i': 2 }}>
          <span className="section-label">Protein · last 14 days</span>
          <svg className="sparkline" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="protGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(96, 165, 250, 0.35)" />
                <stop offset="100%" stopColor="rgba(96, 165, 250, 0)" />
              </linearGradient>
            </defs>
            <path d={protArea} fill="url(#protGrad)" />
            <path d={protLine} className="spark-line" />
          </svg>
        </div>

        <div className="insight-card donut-card stagger-item" style={{ '--i': 3 }}>
          <span className="section-label">Goal tasks done</span>
          <div className="donut-wrap">
            <svg viewBox="0 0 130 130" className="donut">
              <circle cx="65" cy="65" r={DR} className="donut-track" />
              <circle
                cx="65" cy="65" r={DR}
                className="donut-progress"
                style={{ strokeDasharray: DC, strokeDashoffset: donutOffset }}
              />
            </svg>
            <div className="donut-center">
              <span className="donut-pct">{goalPct}%</span>
              <span className="donut-sub">{doneTasks}/{totalTasks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
