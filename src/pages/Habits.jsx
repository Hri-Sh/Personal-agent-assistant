import { useState, useEffect } from 'react'
import './Habits.css'
import AddHabitModal from '../components/AddHabitModal'
import { supabase } from '../lib/supabase'

function dbToHabit(row) {
  return {
    id:             row.id,
    name:           row.name,
    frequency:      row.frequency,
    color:          row.color,
    completedDates: (row.habit_completions ?? []).map(c => c.completed_on),
  }
}

export default function Habits() {
  const today = new Date().toLocaleDateString('en-CA') // 'YYYY-MM-DD'
  const [habits, setHabits] = useState([])
  const [showModal, setShowModal] = useState(false)

  // Load habits + their completions on mount
  useEffect(() => {
    supabase
      .from('habits')
      .select('*, habit_completions(completed_on)')
      .then(({ data, error }) => {
        if (error) { console.error('Error loading habits:', error); return }
        setHabits(data.map(dbToHabit))
      })
  }, [])

  function calcStreak(completedDates) {
    let streak = 0
    const d = new Date()
    while (true) {
      const dateStr = d.toLocaleDateString('en-CA')
      if (completedDates.includes(dateStr)) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  async function toggleToday(id) {
    const habit = habits.find(h => h.id === id)
    const already = habit.completedDates.includes(today)

    if (already) {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', id)
        .eq('completed_on', today)
      if (error) { console.error('Error removing completion:', error); return }
    } else {
      const { error } = await supabase
        .from('habit_completions')
        .insert({ habit_id: id, completed_on: today })
      if (error) { console.error('Error adding completion:', error); return }
    }

    // Update local state to reflect the toggle
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      return {
        ...h,
        completedDates: already
          ? h.completedDates.filter(d => d !== today)
          : [...h.completedDates, today],
      }
    }))
  }

  async function handleAdd(formData) {
    const { data, error } = await supabase
      .from('habits')
      .insert({ name: formData.name, frequency: formData.frequency, color: formData.color })
      .select('*, habit_completions(completed_on)')
      .single()
    if (error) { console.error('Error adding habit:', error); return }
    setHabits(prev => [...prev, dbToHabit(data)])
  }

  return (
    <div className="habits-page">
      <div className="habits-header">
        <div>
          <h2>Habits</h2>
          <span className="habits-date">
            {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <button className="add-habit-btn" onClick={() => setShowModal(true)}>+ Add Habit</button>
      </div>

      <div className="habits-list">
        {habits.map(habit => (
          <div key={habit.id} className="habit-card">
            <div className="habit-color-dot" style={{ background: habit.color }} />
            <div className="habit-info">
              <span className="habit-name">{habit.name}</span>
              <span className="habit-frequency">{habit.frequency}</span>
            </div>
            <div className="habit-streak">🔥 {calcStreak(habit.completedDates)}</div>
            <input
              type="checkbox"
              className="habit-check"
              checked={habit.completedDates.includes(today)}
              onChange={() => toggleToday(habit.id)}
            />
          </div>
        ))}
      </div>

      {showModal && (
        <AddHabitModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
