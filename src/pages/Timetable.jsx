import { useState } from 'react'
import './Timetable.css'

// Config
const START_HOUR = 6   // 6am
const END_HOUR = 23    // 11pm
const HOUR_HEIGHT = 64 // px per hour
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Mock events — replace with Supabase data later
const MOCK_EVENTS = [
  { id: 1, title: 'Morning Run',     day: 1, startHour: 7, startMin: 0, endHour: 8,  endMin: 0,  color: '#4ade80' },
  { id: 2, title: 'CITS2200 Lecture',day: 1, startHour: 9, startMin: 0, endHour: 11, endMin: 0,  color: '#60a5fa' },
  { id: 3, title: 'Gym',             day: 1, startHour: 17,startMin: 0, endHour: 18, endMin: 30, color: '#f87171' },
  { id: 4, title: 'Study Block',     day: 3, startHour: 10,startMin: 0, endHour: 12, endMin: 0,  color: '#a78bfa' },
  { id: 5, title: 'Weekly Review',   day: 0, startHour: 18,startMin: 0, endHour: 19, endMin: 0,  color: '#fb923c' },
]

function getWeekDates(offset = 0) {
  const now = new Date()
  // Start from Sunday of current week
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - now.getDay() + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return d
  })
}

function isToday(date) {
  const now = new Date()
  return date.toDateString() === now.toDateString()
}

function formatHour(h) {
  if (h === 0 || h === 24) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

export default function Timetable() {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekDates = getWeekDates(weekOffset)

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  return (
    <div className="timetable-page">
      {/* Header */}
      <div className="timetable-header">
        <div className="timetable-title">
          <h2>Timetable</h2>
          <span className="week-label">
            {weekDates[0].toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
            {' – '}
            {weekDates[6].toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="timetable-controls">
          <button className="week-nav" onClick={() => setWeekOffset(o => o - 1)}>‹</button>
          <button className="today-btn" onClick={() => setWeekOffset(0)}>Today</button>
          <button className="week-nav" onClick={() => setWeekOffset(o => o + 1)}>›</button>
          <button className="add-event-btn">+ Add Event</button>
        </div>
      </div>

      {/* Grid */}
      <div className="timetable-grid">
        {/* Time gutter */}
        <div className="time-gutter">
          <div className="day-header-spacer" />
          {hours.map(h => (
            <div key={h} className="time-label" style={{ height: HOUR_HEIGHT }}>
              {formatHour(h)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDates.map((date, dayIndex) => {
          const dayEvents = MOCK_EVENTS.filter(e => e.day === dayIndex)
          return (
            <div key={dayIndex} className={`day-column ${isToday(date) ? 'today' : ''}`}>
              {/* Day header */}
              <div className={`day-header ${isToday(date) ? 'today' : ''}`}>
                <span className="day-name">{DAYS[dayIndex]}</span>
                <span className="day-num">{date.getDate()}</span>
              </div>

              {/* Hour cells */}
              <div className="day-body" style={{ height: hours.length * HOUR_HEIGHT }}>
                {hours.map(h => (
                  <div key={h} className="hour-cell" style={{ height: HOUR_HEIGHT }} />
                ))}

                {/* Events */}
                {dayEvents.map(event => {
                  const topOffset = (event.startHour - START_HOUR) * HOUR_HEIGHT
                    + (event.startMin / 60) * HOUR_HEIGHT
                  const duration = (event.endHour - event.startHour)
                    + (event.endMin - event.startMin) / 60
                  const height = duration * HOUR_HEIGHT - 4 // 4px gap

                  return (
                    <div
                      key={event.id}
                      className="event-card"
                      style={{
                        top: topOffset,
                        height,
                        borderLeft: `3px solid ${event.color}`,
                        background: `${event.color}18`, // 10% opacity
                      }}
                    >
                      <p className="event-title" style={{ color: event.color }}>
                        {event.title}
                      </p>
                      <p className="event-time">
                        {formatHour(event.startHour)}
                        {event.startMin > 0 ? `:${String(event.startMin).padStart(2,'0')}` : ''}
                        {' – '}
                        {formatHour(event.endHour)}
                        {event.endMin > 0 ? `:${String(event.endMin).padStart(2,'0')}` : ''}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
