import { useState, useEffect } from 'react'
import './Timetable.css'
import AddEventModal from '../components/AddEventModal'
import EventModal from '../components/EventModal'
import { supabase } from '../lib/supabase'

// Config
const START_HOUR = 6   // 6am
const END_HOUR = 23    // 11pm
const HOUR_HEIGHT = 64 // px per hour
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// DB column names are snake_case; frontend uses camelCase
function dbToEvent(row) {
  return {
    id:          row.id,
    title:       row.title,
    day:         row.day,
    startHour:   row.start_hour,
    startMin:    row.start_min,
    endHour:     row.end_hour,
    endMin:      row.end_min,
    color:       row.color,
    description: row.description ?? '',
  }
}

function eventToDb(event) {
  return {
    title:       event.title,
    day:         event.day,
    start_hour:  event.startHour,
    start_min:   event.startMin,
    end_hour:    event.endHour,
    end_min:     event.endMin,
    color:       event.color,
    description: event.description ?? '',
  }
}

function getWeekDates(offset = 0) {
  const now = new Date()
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
  const [events, setEvents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const weekDates = getWeekDates(weekOffset)

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  // Load all events from Supabase on mount
  useEffect(() => {
    supabase.from('events').select('*')
      .then(({ data, error }) => {
        if (error) { console.error('Error loading events:', error); return }
        setEvents(data.map(dbToEvent))
      })
  }, [])

  async function handleAdd(event) {
    const { data, error } = await supabase
      .from('events')
      .insert(eventToDb(event))
      .select()
      .single()
    if (error) { console.error('Error adding event:', error); return }
    setEvents(prev => [...prev, dbToEvent(data)])
  }

  async function handleUpdate(updated) {
    const { error } = await supabase
      .from('events')
      .update(eventToDb(updated))
      .eq('id', updated.id)
    if (error) { console.error('Error updating event:', error); return }
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
  }

  async function handleDelete(id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
    if (error) { console.error('Error deleting event:', error); return }
    setEvents(prev => prev.filter(e => e.id !== id))
  }

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
          <button className="add-event-btn" onClick={() => setShowModal(true)}>+ Add Event</button>
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
          const dayEvents = events.filter(e => e.day === dayIndex)
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
                  const height = duration * HOUR_HEIGHT - 4

                  return (
                    <div
                      key={event.id}
                      className="event-card"
                      onClick={() => setSelectedEvent(event)}
                      style={{
                        top: topOffset,
                        height,
                        borderLeft: `3px solid ${event.color}`,
                        background: `${event.color}18`,
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

      {showModal && (
        <AddEventModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
