import { useState, useMemo } from 'react'
import './SkillModal.css'

const COLORS = [
  { label: 'Green', value: '#4ade80' },
  { label: 'Blue', value: '#60a5fa' },
  { label: 'Red', value: '#f87171' },
  { label: 'Purple', value: '#a78bfa' },
  { label: 'Orange', value: '#fb923c' },
]

const DEFAULT_CATEGORIES = ['general', 'fitness', 'coding', 'learning', 'career', 'creative']

// One modal for both adding and editing a skill.
// - skill = null        → add mode (defaultParentId pre-selects the parent, e.g. "Add child")
// - skill = { ... }     → edit mode (fields pre-filled; self + descendants excluded from parents)
export default function SkillModal({ skills, skill = null, defaultParentId = null, onSave, onClose }) {
  const isEdit = skill !== null

  const [form, setForm] = useState({
    name:     skill?.name ?? '',
    category: skill?.category ?? 'general',
    color:    skill?.color ?? '#4ade80',
    parentId: skill?.parentId != null ? String(skill.parentId)
            : defaultParentId != null ? String(defaultParentId)
            : '',
  })

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  // Categories the user has already used + defaults → datalist suggestions
  const categories = useMemo(() => {
    const seen = new Set(DEFAULT_CATEGORIES)
    for (const s of skills) {
      const c = (s.category ?? '').trim()
      if (c) seen.add(c.toLowerCase())
    }
    return [...seen]
  }, [skills])

  // In edit mode, a skill can't become a child of itself or of its own descendants
  const excludedIds = useMemo(() => {
    if (!isEdit) return new Set()
    const childrenMap = {}
    for (const s of skills) {
      const key = s.parentId ?? 'root'
      if (!childrenMap[key]) childrenMap[key] = []
      childrenMap[key].push(s)
    }
    const out = new Set([skill.id])
    const stack = [...(childrenMap[skill.id] ?? [])]
    while (stack.length) {
      const node = stack.pop()
      out.add(node.id)
      stack.push(...(childrenMap[node.id] ?? []))
    }
    return out
  }, [isEdit, skill, skills])

  const parentOptions = skills.filter(s => !excludedIds.has(s.id))
  const isPresetColor = COLORS.some(c => c.value === form.color)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      name:     form.name.trim(),
      category: form.category.trim().toLowerCase() || 'general',
      color:    form.color,
      parentId: form.parentId === '' ? null : Number(form.parentId),
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit Skill' : 'Add Skill'}</h3>
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
              placeholder="Pick one or type your own"
            />
            <datalist id="skill-categories">
              {categories.map(c => <option key={c} value={c} />)}
            </datalist>
          </label>

          <label>
            Parent skill
            <select value={form.parentId} onChange={e => set('parentId', e.target.value)}>
              <option value="">None (root)</option>
              {parentOptions.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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
                  onClick={() => set('color', color.value)}
                />
              ))}
              <span
                className={`color-dot color-dot-custom ${!isPresetColor ? 'selected' : ''}`}
                style={!isPresetColor ? { background: form.color } : null}
                title="Custom color"
              >
                <input
                  type="color"
                  value={form.color}
                  onChange={e => set('color', e.target.value)}
                  aria-label="Custom color"
                />
              </span>
            </div>
          </label>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">{isEdit ? 'Save' : 'Add Skill'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
