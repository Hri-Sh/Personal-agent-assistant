import { useState, useEffect } from 'react'
import { Lock, Check, X } from 'lucide-react'
import './SkillTree.css'
import AddSkillModal from '../components/AddSkillModal'
import { supabase } from '../lib/supabase'

// DB columns are snake_case; frontend uses camelCase
function dbToSkill(row) {
  return {
    id:       row.id,
    name:     row.name,
    category: row.category ?? 'general',
    unlocked: row.unlocked,
    parentId: row.parent_id,
  }
}

function skillToDb(skill) {
  return {
    name:      skill.name,
    category:  skill.category,
    parent_id: skill.parentId,
  }
}

const CATEGORY_COLORS = {
  general:  '#4ade80',
  fitness:  '#f87171',
  coding:   '#60a5fa',
  learning: '#a78bfa',
  career:   '#fb923c',
  creative: '#fb923c',
}

function categoryColor(category) {
  return CATEGORY_COLORS[(category ?? '').toLowerCase()] ?? '#4ade80'
}

export default function SkillTree() {
  const [skills, setSkills] = useState([])
  const [showModal, setShowModal] = useState(false)

  // Load all skills on mount
  useEffect(() => {
    supabase
      .from('skills')
      .select('*')
      .order('id', { ascending: true })
      .then(({ data, error }) => {
        if (error) { console.error('Error loading skills:', error); return }
        setSkills(data.map(dbToSkill))
      })
  }, [])

  // Group children by parent for fast tree building
  const childrenMap = {}
  for (const s of skills) {
    const key = s.parentId ?? 'root'
    if (!childrenMap[key]) childrenMap[key] = []
    childrenMap[key].push(s)
  }
  const roots = childrenMap['root'] ?? []

  function descendantIds(id) {
    const out = []
    const stack = [...(childrenMap[id] ?? [])]
    while (stack.length) {
      const node = stack.pop()
      out.push(node.id)
      stack.push(...(childrenMap[node.id] ?? []))
    }
    return out
  }

  function isAvailable(skill) {
    if (!skill.parentId) return true
    const parent = skills.find(s => s.id === skill.parentId)
    return parent ? parent.unlocked : true
  }

  async function handleAdd(form) {
    const { data, error } = await supabase
      .from('skills')
      .insert(skillToDb(form))
      .select()
      .single()
    if (error) { console.error('Error adding skill:', error); return }
    setSkills(prev => [...prev, dbToSkill(data)])
  }

  async function handleToggle(skill) {
    if (skill.unlocked) {
      // Lock this node and everything below it
      const ids = [skill.id, ...descendantIds(skill.id)]
      const { error } = await supabase
        .from('skills')
        .update({ unlocked: false })
        .in('id', ids)
      if (error) { console.error('Error locking skill:', error); return }
      setSkills(prev => prev.map(s => ids.includes(s.id) ? { ...s, unlocked: false } : s))
    } else {
      if (!isAvailable(skill)) return // parent must be unlocked first
      const { error } = await supabase
        .from('skills')
        .update({ unlocked: true })
        .eq('id', skill.id)
      if (error) { console.error('Error unlocking skill:', error); return }
      setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, unlocked: true } : s))
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) { console.error('Error deleting skill:', error); return }
    // Children have ON DELETE SET NULL — they become roots
    setSkills(prev => prev
      .filter(s => s.id !== id)
      .map(s => s.parentId === id ? { ...s, parentId: null } : s))
  }

  function renderNode(skill) {
    const kids = childrenMap[skill.id] ?? []
    const color = categoryColor(skill.category)
    const available = isAvailable(skill)
    const blocked = !skill.unlocked && !available

    return (
      <li key={skill.id}>
        <div
          className={`skill-node ${skill.unlocked ? 'unlocked' : 'locked'} ${blocked ? 'blocked' : ''}`}
          style={skill.unlocked ? { borderColor: color } : null}
          onClick={() => handleToggle(skill)}
          title={
            skill.unlocked ? 'Click to lock'
            : available ? 'Click to unlock'
            : 'Unlock the parent skill first'
          }
        >
          <button
            className="skill-node-delete"
            onClick={e => { e.stopPropagation(); handleDelete(skill.id) }}
            title="Delete skill"
          >
            <X size={12} />
          </button>
          <span
            className="skill-node-badge"
            style={skill.unlocked ? { background: color, color: '#000', borderColor: color } : null}
          >
            {skill.unlocked ? <Check size={14} strokeWidth={3} /> : <Lock size={12} />}
          </span>
          <span className="skill-node-name" style={skill.unlocked ? { color } : null}>
            {skill.name}
          </span>
          <span className="skill-node-category">{skill.category}</span>
        </div>

        {kids.length > 0 && (
          <ul>{kids.map(renderNode)}</ul>
        )}
      </li>
    )
  }

  return (
    <div className="skilltree-page">
      <div className="skilltree-header">
        <div>
          <h2>Skill Tree</h2>
          <span className="skilltree-date">
            {skills.filter(s => s.unlocked).length} / {skills.length} unlocked
          </span>
        </div>
        <button className="add-skill-btn" onClick={() => setShowModal(true)}>+ Add Skill</button>
      </div>

      <div className="skilltree-canvas">
        {roots.length === 0 ? (
          <p className="skilltree-empty">No skills yet. Add a root skill to start your tree.</p>
        ) : (
          <ul className="skill-tree">
            {roots.map(renderNode)}
          </ul>
        )}
      </div>

      {showModal && (
        <AddSkillModal
          skills={skills}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
