import { useState } from 'react'
import './AddSkillModal.css'

const CATEGORIES = ['general', 'fitness', 'coding', 'learning', 'career', 'creative']

export default function AddSkillModal({ skills, onAdd, onClose }) {
  const [form, setForm] = useState({
    name: '',
    category: 'general',
    parentId: '',
  })

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onAdd({
      name:     form.name.trim(),
      category: form.category.trim() || 'general',
      parentId: form.parentId === '' ? null : Number(form.parentId),
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Add Skill</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Pull-ups"
              autoFocus
            />
          </label>

          <label>
            Category
            <input
              type="text"
              list="skill-categories"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              placeholder="e.g. fitness"
            />
            <datalist id="skill-categories">
              {CATEGORIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </label>

          <label>
            Parent skill
            <select value={form.parentId} onChange={e => set('parentId', e.target.value)}>
              <option value="">None (root)</option>
              {skills.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Add Skill</button>
          </div>
        </form>
      </div>
    </div>
  )
}
