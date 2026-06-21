import { useState } from 'react'
import './AddGoalModal.css'

const COLORS = [
  { label: 'Green',  value: '#4ade80' },
  { label: 'Blue',   value: '#60a5fa' },
  { label: 'Red',    value: '#f87171' },
  { label: 'Purple', value: '#a78bfa' },
  { label: 'Orange', value: '#fb923c' },
]

export default function AddGoalModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    color: '#4ade80',
  })

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onAdd({ ...form })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Add Goal</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Learn React"
              autoFocus
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional notes..."
            />
          </label>

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

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Add Goal</button>
          </div>
        </form>
      </div>
    </div>
  )
}
