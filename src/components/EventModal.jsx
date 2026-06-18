import { useState } from 'react'
import { Pencil, X, Trash2, Check } from 'lucide-react'
import './EventModal.css'

const COLORS = [
  { label: 'Green',  value: '#4ade80' },
  { label: 'Blue',   value: '#60a5fa' },
  { label: 'Red',    value: '#f87171' },
  { label: 'Purple', value: '#a78bfa' },
  { label: 'Orange', value: '#fb923c' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTime(hour, min) {
  const h = hour === 0 || hour === 24 ? 12 : hour > 12 ? hour - 12 : hour
  const suffix = hour < 12 || hour === 24 ? 'am' : 'pm'
  const m = min > 0 ? `:${String(min).padStart(2, '0')}` : ''
  return `${h}${m}${suffix}`
}

export default function EventModal({ event, onClose, onUpdate, onDelete }) {
  const [mode, setMode] = useState('view') // 'view' | 'edit'
  const [form, setForm] = useState({ ...event })

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSave(e) {
    e.preventDefault()
    const startTotal = form.startHour * 60 + form.startMin
    const endTotal   = form.endHour   * 60 + form.endMin
    if (endTotal <= startTotal) return
    onUpdate({ ...form, day: Number(form.day) })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal event-modal" onClick={e => e.stopPropagation()}>

        {/* Top bar */}
        <div className="event-modal-topbar">
          <div
            className="event-modal-color-chip"
            style={{ background: form.color }}
          />
          {mode === 'view' ? (
            <>
              <button className="icon-btn" onClick={() => setMode('edit')} title="Edit">
                <Pencil size={15} />
              </button>
              <button className="icon-btn danger" onClick={() => { onDelete(event.id); onClose() }} title="Delete">
                <Trash2 size={15} />
              </button>
            </>
          ) : (
            <button className="icon-btn" onClick={() => setMode('view')} title="Cancel edit">
              <X size={15} />
            </button>
          )}
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={15} />
          </button>
        </div>

        {mode === 'view' ? (
          /* ── View mode ── */
          <div className="event-detail">
            <h3 className="event-detail-title" style={{ color: event.color }}>
              {event.title}
            </h3>
            <div className="event-detail-row">
              <span className="detail-label">Day</span>
              <span>{DAYS[event.day]}</span>
            </div>
            <div className="event-detail-row">
              <span className="detail-label">Time</span>
              <span>
                {formatTime(event.startHour, event.startMin)}
                {' – '}
                {formatTime(event.endHour, event.endMin)}
              </span>
            </div>
            <div className="event-detail-row">
              <span className="detail-label">Duration</span>
              <span>
                {(() => {
                  const mins = (event.endHour * 60 + event.endMin) - (event.startHour * 60 + event.startMin)
                  const h = Math.floor(mins / 60)
                  const m = mins % 60
                  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`
                })()}
              </span>
            </div>
            {event.description?.trim() && (
              <div className="event-detail-row">
                <span className='detail-label'>Description</span>
                <span>{event.description.trim()}</span>
              </div>
            )}
          </div>
        ) : (
          /* ── Edit mode ── */
          <form className="event-edit-form" onSubmit={handleSave}>
            <label>
              Title
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                autoFocus
              />
            </label>

            <label>
              Day
              <select value={form.day} onChange={e => set('day', e.target.value)}>
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </label>

            <div className="time-row">
              <label>
                Start
                <input type="number" min={0} max={23} value={form.startHour}
                  onChange={e => set('startHour', Number(e.target.value))} />
                <span>:</span>
                <input type="number" min={0} max={59} step={15} value={form.startMin}
                  onChange={e => set('startMin', Number(e.target.value))} />
              </label>
              <label>
                End
                <input type="number" min={0} max={23} value={form.endHour}
                  onChange={e => set('endHour', Number(e.target.value))} />
                <span>:</span>
                <input type="number" min={0} max={59} step={15} value={form.endMin}
                  onChange={e => set('endMin', Number(e.target.value))} />
              </label>
            </div>

            <label>
              Color
              <div className="color-picker">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    className={`color-dot ${form.color === c.value ? 'selected' : ''}`}
                    style={{ background: c.value }}
                    aria-label={c.label}
                    onClick={() => set('color', c.value)}
                  />
                ))}
              </div>
            </label>
            <label>
              Description
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional notes..."
            />
</label>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setMode('view')}>Cancel</button>
              <button type="submit" className="submit-btn">
                <Check size={14} /> Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
