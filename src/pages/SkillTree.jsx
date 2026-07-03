import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { Lock, Unlock, Check, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import './SkillTree.css'
import SkillModal from '../components/SkillModal'
import { supabase } from '../lib/supabase'
import { fireConfetti } from '../lib/confetti'

// Legacy category→color mapping — only used as a fallback for rows
// created before the per-skill `color` column existed.
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

// DB columns are snake_case; frontend uses camelCase
function dbToSkill(row) {
  return {
    id:       row.id,
    name:     row.name,
    category: row.category ?? 'general',
    color:    row.color ?? categoryColor(row.category),
    unlocked: row.unlocked,
    parentId: row.parent_id,
  }
}

function skillToDb(skill) {
  return {
    name:      skill.name,
    category:  skill.category,
    color:     skill.color,
    parent_id: skill.parentId,
  }
}

const MENU_WIDTH = 180 // keep in sync with .skill-menu width

export default function SkillTree() {
  const [skills, setSkills] = useState([])
  const [modal, setModal] = useState(null)   // null | { mode: 'add', parentId } | { mode: 'edit', skill }
  const [menu, setMenu] = useState(null)     // null | { skill, x, y }
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

  // Any click, Escape, scroll, or resize dismisses the context menu
  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const onKey = e => { if (e.key === 'Escape') close() }
    window.addEventListener('click', close)
    window.addEventListener('contextmenu', close)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('contextmenu', close)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [menu])

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
        color: s.color,
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

  function openMenu(skill, x, y) {
    setMenu({
      skill,
      x: Math.max(8, Math.min(x, window.innerWidth - MENU_WIDTH - 12)),
      y: Math.max(8, Math.min(y, window.innerHeight - 200)),
    })
  }

  async function handleSave(form) {
    if (modal?.mode === 'edit') {
      const id = modal.skill.id
      const { error } = await supabase
        .from('skills')
        .update(skillToDb(form))
        .eq('id', id)
      if (error) { console.error('Error updating skill:', error); return }
      setSkills(prev => prev.map(s => s.id === id ? { ...s, ...form } : s))
    } else {
      const { data, error } = await supabase
        .from('skills')
        .insert(skillToDb(form))
        .select()
        .single()
      if (error) { console.error('Error adding skill:', error); return }
      setSkills(prev => [...prev, dbToSkill(data)])
    }
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
      fireConfetti({ origin: el, count: 40, power: 9, spread: 1.3, colors: [skill.color, '#fde047', '#f5f5f5'] })
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
    const color = skill.color
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
          onContextMenu={e => {
            e.preventDefault()
            e.stopPropagation()
            openMenu(skill, e.clientX, e.clientY)
          }}
          title={
            skill.unlocked ? 'Click to lock'
            : available ? 'Click to unlock'
            : 'Unlock the parent skill first'
          }
        >
          <button
            className="skill-node-kebab"
            onClick={e => {
              e.stopPropagation()
              const r = e.currentTarget.getBoundingClientRect()
              openMenu(skill, r.right - MENU_WIDTH, r.bottom + 6)
            }}
            title="Skill options"
          >
            <MoreVertical size={14} />
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
  const menuBlocked = menu ? (!menu.skill.unlocked && !isAvailable(menu.skill)) : false

  return (
    <div className="skilltree-page page-enter">
      <div className="skilltree-header">
        <div>
          <h2>Skill Tree</h2>
          <span className="skilltree-date">{unlockedCount} / {skills.length} unlocked</span>
        </div>
        <button className="add-skill-btn press" onClick={() => setModal({ mode: 'add', parentId: null })}>
          + Add Skill
        </button>
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

      {menu && (
        <div
          className="skill-menu"
          style={{ left: menu.x, top: menu.y }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="skill-menu-item"
            onClick={() => { setModal({ mode: 'edit', skill: menu.skill }); setMenu(null) }}
          >
            <Pencil size={14} /> Edit skill
          </button>
          <button
            className="skill-menu-item"
            onClick={() => { setModal({ mode: 'add', parentId: menu.skill.id }); setMenu(null) }}
          >
            <Plus size={14} /> Add child node
          </button>
          <button
            className="skill-menu-item"
            disabled={menuBlocked}
            title={menuBlocked ? 'Unlock the parent skill first' : undefined}
            onClick={() => { handleToggle(menu.skill); setMenu(null) }}
          >
            {menu.skill.unlocked ? <><Lock size={14} /> Lock</> : <><Unlock size={14} /> Unlock</>}
          </button>
          <div className="skill-menu-divider" />
          <button
            className="skill-menu-item danger"
            onClick={() => { handleDelete(menu.skill.id); setMenu(null) }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {modal && (
        <SkillModal
          skills={skills}
          skill={modal.mode === 'edit' ? modal.skill : null}
          defaultParentId={modal.mode === 'add' ? modal.parentId : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
