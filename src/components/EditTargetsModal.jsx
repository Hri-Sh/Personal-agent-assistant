import { useState } from 'react'
import './EditTargetsModal.css'

export default function EditTargetsModal({ targets, onSave, onClose }) {
  const [form, setForm] = useState({
    calorieTarget: String(targets.calorieTarget),
    proteinTarget: String(targets.proteinTarget),
  })

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const calorieTarget = Number(form.calorieTarget)
    const proteinTarget = Number(form.proteinTarget)
    if (!Number.isFinite(calorieTarget) || calorieTarget <= 0) return
    if (!Number.isFinite(proteinTarget) || proteinTarget < 0) return
    onSave({ calorieTarget, proteinTarget })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Daily Targets</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Calorie target (kcal)
            <input
              type="number"
              min="1"
              value={form.calorieTarget}
              onChange={e => set('calorieTarget', e.target.value)}
              autoFocus
            />
          </label>

          <label>
            Protein target (g)
            <input
              type="number"
              min="0"
              value={form.proteinTarget}
              onChange={e => set('proteinTarget', e.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
