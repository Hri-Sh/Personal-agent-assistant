import { useState } from 'react'
import './AddMealModal.css'

export default function AddMealModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const calories = Number(form.calories)
    if (!Number.isFinite(calories) || calories < 0) return
    onAdd({
      name:    form.name.trim(),
      calories,
      protein: Number(form.protein) || 0,
      carbs:   Number(form.carbs) || 0,
      fat:     Number(form.fat) || 0,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Log Meal</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Chicken & rice"
              autoFocus
            />
          </label>

          <label>
            Calories
            <input
              type="number"
              min="0"
              value={form.calories}
              onChange={e => set('calories', e.target.value)}
              placeholder="kcal"
            />
          </label>

          <div className="macro-row">
            <label>
              Protein (g)
              <input
                type="number"
                min="0"
                value={form.protein}
                onChange={e => set('protein', e.target.value)}
                placeholder="0"
              />
            </label>
            <label>
              Carbs (g)
              <input
                type="number"
                min="0"
                value={form.carbs}
                onChange={e => set('carbs', e.target.value)}
                placeholder="0"
              />
            </label>
            <label>
              Fat (g)
              <input
                type="number"
                min="0"
                value={form.fat}
                onChange={e => set('fat', e.target.value)}
                placeholder="0"
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Log Meal</button>
          </div>
        </form>
      </div>
    </div>
  )
}
