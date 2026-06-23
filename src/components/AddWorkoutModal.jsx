import { useState } from 'react'
import './AddWorkoutModal.css'
import { MUSCLE_GROUPS, muscleLabel, WORKOUT_PRESETS } from '../lib/muscles'

export default function AddWorkoutModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [muscles, setMuscles] = useState([])

  function toggleMuscle(m) {
    setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  function applyPreset(preset) {
    setName(n => n.trim() ? n : preset.name)
    setMuscles(preset.muscles)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || muscles.length === 0) return
    onAdd({ name: name.trim(), muscles })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal workout-modal" onClick={e => e.stopPropagation()}>
        <h3>Log Workout</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Push day"
              autoFocus
            />
          </label>

          <div className="workout-presets">
            {WORKOUT_PRESETS.map(p => (
              <button
                key={p.name}
                type="button"
                className="preset-chip press"
                onClick={() => applyPreset(p)}
              >
                {p.name}
              </button>
            ))}
          </div>

          <label className="muscles-label">
            Muscles worked
            <div className="muscle-chips">
              {MUSCLE_GROUPS.map(m => (
                <button
                  key={m}
                  type="button"
                  className={`muscle-chip press ${muscles.includes(m) ? 'selected' : ''}`}
                  onClick={() => toggleMuscle(m)}
                >
                  {muscleLabel(m)}
                </button>
              ))}
            </div>
          </label>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Log Workout</button>
          </div>
        </form>
      </div>
    </div>
  )
}
