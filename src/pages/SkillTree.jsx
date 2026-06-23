import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { Lock, Check, X } from 'lucide-react'
import './SkillTree.css'
import AddSkillModal from '../components/AddSkillModal'
import { supabase } from '../lib/supabase'
import { fireConfetti } from '../lib/confetti'

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
  const [paths, setPaths] = useState([])
  const [justUnlocked, setJustUnlocked] = useState(null)

  const innerRef = useRef(null)
  const nodeRefs = useRef(new Map())

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

  // Draw curved branches between parent/child node centers
  const computePaths = useCallback(() => {
    const inner = innerRef.current
    if (!inner) return
    const iRect = inner.getBoundingClientRect()
    const next = []
    for (const s of skills) {
      if (!s.parentId) continue
      const childEl = nodeRefs.current.get(s.id)
      const parentEl = nodeRefs.current.get(s.parentId)
      if (!childEl || !parentEl) continue
      const pr = parentEl.getBoundingClientRect()
      const cr = childEl.getBoundingClientRect()
      const x1 = pr.left + pr.width / 2 - iRect.left
      const y1 = pr.bottom - iRect.top
      const x2 = cr.left + cr.width / 2 - iRect.left
      const y2 = cr.top - iRect.top
      const my = (y1 + y2) / 2
      const parent = skills.find(p => p.id === s.parentId)
      next.push({
        id: s.id,
        d: `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`,
        active: parent ? parent.unlocked : false,
        color: categoryColor(s.category),
      })
    }
    setPaths(next)
  }, [skills])

  useLayoutEffect(() => {
    computePaths()
    const raf = requestAnimationFrame(computePaths) // catch late layout/fonts
    window.addEventListener('resize', computePaths)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', computePaths)
    }
  }, [computePaths])

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
      // Celebrate
      const el = nodeRefs.current.get(skill.id)
      fireConfetti({ origin: el, count: 40, power: 9, spread: 1.3, colors: [categoryColor(skill.category), '#fde047', '#f5f5f5'] })
      setJustUnlocked(skill.id)
      setTimeout(() => setJustUnlocked(curr => (curr === skill.id ? null : curr)), 700)
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
          ref={el => {
            if (el) nodeRefs.current.set(skill.id, el)
            else nodeRefs.current.delete(skill.id)
          }}
          className={`skill-node ${skill.unlocked ? 'unlocked' : 'locked'} ${blocked ? 'blocked' : ''} ${justUnlocked === skill.id ? 'unlocking' : ''}`}
          style={skill.unlocked ? { '--node-color': color, borderColor: color } : null}
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

  const unlockedCount = skills.filter(s => s.unlocked).length

  return (
    <div className="skilltree-page page-enter">
      <div className="skilltree-header">
        <div>
          <h2>Skill Tree</h2>
          <span className="skilltree-date">{unlockedCount} / {skills.length} unlocked</span>
        </div>
        <button className="add-skill-btn press" onClick={() => setShowModal(true)}>+ Add Skill</button>
      </div>

      <div className="skilltree-canvas">
        {roots.length === 0 ? (
          <p className="skilltree-empty">No skills yet. Add a root skill to start your tree.</p>
        ) : (
          <div className="skilltree-inner" ref={innerRef}>
            <svg className="skilltree-branches" xmlns="http://www.w3.org/2000/svg">
              {paths.map(p => (
                <path
                  key={p.id}
                  d={p.d}
                  className={`branch ${p.active ? 'active' : ''}`}
                  style={p.active ? { '--branch-color': p.color } : null}
                />
              ))}
            </svg>
            <ul className="skill-tree">
              {roots.map(renderNode)}
            </ul>
          </div>
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
