import { useState } from 'react'
import './AddEventModal.css'

const COLORS = [
  { label: 'Green', value: '#4ade80' },
  { label: 'Blue', value: '#60a5fa' },
  { label: 'Red', value: '#f87171' },
  { label: 'Purple', value: '#a78bfa' },
  { label: 'Orange', value: '#fb923c' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AddEventModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    title: '',
    day: 1,
    startHour: 9,
    startMin: 0,
    endHour: 10,
    endMin: 0,
    description: '',
    color: '#4ade80',
  })

  function updateField(key, value) {
    setForm(current => ({ ...current, [key]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const startTotal = Number(form.startHour) * 60 + Number(form.startMin)
    const endTotal   = Number(form.endHour)   * 60 + Number(form.endMin)
    if (endTotal <= startTotal) return 

    if (!form.title.trim()) return

    onAdd({
      ...form,
      id: Date.now(),
      day: Number(form.day),
      startHour: Number(form.startHour),
      startMin: Number(form.startMin),
      endHour: Number(form.endHour),
      endMin: Number(form.endMin),
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={event => event.stopPropagation()}>
        <h3>Add Event</h3>

        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={form.title}
              onChange={event => updateField('title', event.target.value)}
              placeholder="e.g. Morning Run"
              autoFocus
            />
          </label>

          <label>
            Day
            <select value={form.day} onChange={event => updateField('day', event.target.value)}>
              {DAYS.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </label>

          <div className="time-row">
            <label>
              Start
              <input
                type="number"
                min="0"
                max="23"
                value={form.startHour}
                onChange={event => updateField('startHour', Number(event.target.value))}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={form.startMin}
                onChange={event => updateField('startMin', Number(event.target.value))}
              />
            </label>

            <label>
              End
              <input
                type="number"
                min="0"
                max="23"
                value={form.endHour}
                onChange={event => updateField('endHour', Number(event.target.value))}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={form.endMin}
                onChange={event => updateField('endMin', Number(event.target.value))}
              />
            </label>
          </div>
            <label>
                Description
                <textarea
                    value={form.description}
                    onChange={event => updateField('description', event.target.value)}
                    placeholder="Optional notes..."
                />
</label>


          <label>
            Color
            <div className="color-picker">
              {COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  className={`color-dot ${form.color === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.label}
                  onClick={() => updateField('color', color.value)}
                />
              ))}
            </div>
          </label>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}