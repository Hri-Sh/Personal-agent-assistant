import { useState } from 'react'
import './AddListModal.css'

const COLORS = [
  { label: 'Green',  value: '#4ade80' },
  { label: 'Blue',   value: '#60a5fa' },
  { label: 'Red',    value: '#f87171' },
  { label: 'Purple', value: '#a78bfa' },
  { label: 'Orange', value: '#fb923c' },
]

export default function AddListModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name: '',
    color: '#4ade80',
  })

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onAdd({ ...form, name: form.name.trim() })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>New List</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Travel"
              autoFocus
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
            <button type="submit" className="submit-btn">Create List</button>
          </div>
        </form>
      </div>
    </div>
  )
}
