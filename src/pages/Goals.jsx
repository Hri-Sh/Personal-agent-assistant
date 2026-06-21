import { useState, useEffect } from 'react'
import { Trash2, Plus, Check } from 'lucide-react'
import './Goals.css'
import AddGoalModal from '../components/AddGoalModal'
import { supabase } from '../lib/supabase'

// DB columns are snake_case; goal_tasks come nested from the join
function dbToGoal(row) {
  return {
    id:          row.id,
    title:       row.title,
    description: row.description ?? '',
    color:       row.color,
    tasks:       (row.goal_tasks ?? [])
      .slice()
      .sort((a, b) => a.id - b.id)
      .map(t => ({ id: t.id, title: t.title, done: t.done })),
  }
}

function goalToDb(goal) {
  return {
    title:       goal.title,
    description: goal.description ?? '',
    color:       goal.color,
  }
}

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [taskDrafts, setTaskDrafts] = useState({}) // { [goalId]: string }

  // Load goals + their sub-tasks on mount
  useEffect(() => {
    supabase
      .from('goals')
      .select('*, goal_tasks(*)')
      .then(({ data, error }) => {
        if (error) { console.error('Error loading goals:', error); return }
        setGoals(data.map(dbToGoal))
      })
  }, [])

  async function handleAdd(form) {
    const { data, error } = await supabase
      .from('goals')
      .insert(goalToDb(form))
      .select('*, goal_tasks(*)')
      .single()
    if (error) { console.error('Error adding goal:', error); return }
    setGoals(prev => [...prev, dbToGoal(data)])
  }

  async function handleDeleteGoal(id) {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) { console.error('Error deleting goal:', error); return }
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  async function handleAddTask(goalId) {
    const title = (taskDrafts[goalId] ?? '').trim()
    if (!title) return
    const { data, error } = await supabase
      .from('goal_tasks')
      .insert({ goal_id: goalId, title })
      .select()
      .single()
    if (error) { console.error('Error adding task:', error); return }
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, tasks: [...g.tasks, { id: data.id, title: data.title, done: data.done }] }
        : g
    ))
    setTaskDrafts(d => ({ ...d, [goalId]: '' }))
  }

  async function handleToggleTask(goalId, task) {
    const { error } = await supabase
      .from('goal_tasks')
      .update({ done: !task.done })
      .eq('id', task.id)
    if (error) { console.error('Error toggling task:', error); return }
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t) }
        : g
    ))
  }

  async function handleDeleteTask(goalId, taskId) {
    const { error } = await supabase.from('goal_tasks').delete().eq('id', taskId)
    if (error) { console.error('Error deleting task:', error); return }
    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, tasks: g.tasks.filter(t => t.id !== taskId) } : g
    ))
  }

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div>
          <h2>Goals</h2>
          <span className="goals-date">
            {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <button className="add-goal-btn" onClick={() => setShowModal(true)}>+ Add Goal</button>
      </div>

      <div className="goals-list">
        {goals.length === 0 && (
          <p className="goals-empty">No goals yet. Add one to get started.</p>
        )}

        {goals.map(goal => {
          const total = goal.tasks.length
          const done = goal.tasks.filter(t => t.done).length
          const pct = total === 0 ? 0 : Math.round((done / total) * 100)

          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-card-top">
                <div className="goal-color-dot" style={{ background: goal.color }} />
                <div className="goal-info">
                  <span className="goal-title">{goal.title}</span>
                  {goal.description && (
                    <span className="goal-description">{goal.description}</span>
                  )}
                </div>
                <span className="goal-pct">{pct}%</span>
                <button
                  className="goal-delete-btn"
                  onClick={() => handleDeleteGoal(goal.id)}
                  title="Delete goal"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="goal-progress-bar">
                <div
                  className="goal-progress-fill"
                  style={{ width: `${pct}%`, background: goal.color }}
                />
              </div>

              <div className="goal-tasks">
                {goal.tasks.map(task => (
                  <div key={task.id} className={`goal-task ${task.done ? 'done' : ''}`}>
                    <button
                      className={`goal-task-check ${task.done ? 'checked' : ''}`}
                      style={task.done ? { background: goal.color, borderColor: goal.color } : null}
                      onClick={() => handleToggleTask(goal.id, task)}
                      title={task.done ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.done && <Check size={12} strokeWidth={3} />}
                    </button>
                    <span className="goal-task-title">{task.title}</span>
                    <button
                      className="goal-task-delete"
                      onClick={() => handleDeleteTask(goal.id, task.id)}
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                <form
                  className="goal-add-task"
                  onSubmit={e => { e.preventDefault(); handleAddTask(goal.id) }}
                >
                  <input
                    type="text"
                    placeholder="Add a sub-task..."
                    value={taskDrafts[goal.id] ?? ''}
                    onChange={e => setTaskDrafts(d => ({ ...d, [goal.id]: e.target.value }))}
                  />
                  <button type="submit" className="goal-add-task-btn" title="Add sub-task">
                    <Plus size={15} />
                  </button>
                </form>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <AddGoalModal onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
