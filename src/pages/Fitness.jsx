import { useState, useEffect } from 'react'
import { Trash2, Settings, Dumbbell } from 'lucide-react'
import './Fitness.css'
import AddMealModal from '../components/AddMealModal'
import EditTargetsModal from '../components/EditTargetsModal'
import AddWorkoutModal from '../components/AddWorkoutModal'
import BodyMap from '../components/BodyMap'
import { supabase } from '../lib/supabase'
import { fireConfetti } from '../lib/confetti'
import { muscleLabel } from '../lib/muscles'

// DB columns are snake_case; frontend uses camelCase
function dbToMeal(row) {
  return {
    id:       row.id,
    name:     row.name,
    calories: row.calories,
    protein:  row.protein_g,
    carbs:    row.carbs_g,
    fat:      row.fat_g,
  }
}

function mealToDb(meal, loggedOn) {
  return {
    name:      meal.name,
    calories:  meal.calories,
    protein_g: meal.protein,
    carbs_g:   meal.carbs,
    fat_g:     meal.fat,
    logged_on: loggedOn,
  }
}

function dbToWorkout(row) {
  return {
    id:        row.id,
    name:      row.name,
    muscles:   row.muscles ?? [],
    loggedOn:  row.logged_on,
    createdAt: row.created_at,
  }
}

const DEFAULT_TARGETS = { calorieTarget: 2000, proteinTarget: 150 }

function daysAgoISO(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-CA')
}

export default function Fitness() {
  const today = new Date().toLocaleDateString('en-CA') // 'YYYY-MM-DD'
  const weekAgo = daysAgoISO(6)   // last 7 days inclusive — workout log display
  const monthAgo = daysAgoISO(29) // recovery map looks further back
  const [meals, setMeals] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [now, setNow] = useState(Date.now()) // ticks so "x ago" stays fresh
  const [targets, setTargets] = useState(DEFAULT_TARGETS)
  const [targetsId, setTargetsId] = useState(null)
  const [showMealModal, setShowMealModal] = useState(false)
  const [showTargetsModal, setShowTargetsModal] = useState(false)
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)

  // Load today's meals, this week's workouts, and targets on mount
  useEffect(() => {
    supabase
      .from('meals')
      .select('*')
      .eq('logged_on', today)
      .then(({ data, error }) => {
        if (error) { console.error('Error loading meals:', error); return }
        setMeals(data.map(dbToMeal))
      })

    supabase
      .from('workouts')
      .select('*')
      .gte('logged_on', monthAgo)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('Error loading workouts:', error); return }
        setWorkouts(data.map(dbToWorkout))
      })

    supabase
      .from('fitness_targets')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .then(({ data, error }) => {
        if (error) { console.error('Error loading targets:', error); return }
        if (data && data.length > 0) {
          setTargets({
            calorieTarget: data[0].calorie_target,
            proteinTarget: data[0].protein_target,
          })
          setTargetsId(data[0].id)
        }
      })
  }, [today, monthAgo])

  // Refresh the "last trained x ago" labels every minute
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(t)
  }, [])

  async function handleAddMeal(meal) {
    const { data, error } = await supabase
      .from('meals')
      .insert(mealToDb(meal, today))
      .select()
      .single()
    if (error) { console.error('Error logging meal:', error); return }
    setMeals(prev => [...prev, dbToMeal(data)])
  }

  async function handleDeleteMeal(id) {
    const { error } = await supabase.from('meals').delete().eq('id', id)
    if (error) { console.error('Error deleting meal:', error); return }
    setMeals(prev => prev.filter(m => m.id !== id))
  }

  async function handleAddWorkout(workout) {
    const { data, error } = await supabase
      .from('workouts')
      .insert({ name: workout.name, muscles: workout.muscles, logged_on: today })
      .select()
      .single()
    if (error) { console.error('Error logging workout:', error); return }
    setWorkouts(prev => [dbToWorkout(data), ...prev])
    fireConfetti({ count: 60, power: 10, spread: 1.4, colors: ['#f87171', '#fb923c', '#fde047'] })
  }

  async function handleDeleteWorkout(id) {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) { console.error('Error deleting workout:', error); return }
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  async function handleSaveTargets(next) {
    if (targetsId) {
      const { error } = await supabase
        .from('fitness_targets')
        .update({ calorie_target: next.calorieTarget, protein_target: next.proteinTarget })
        .eq('id', targetsId)
      if (error) { console.error('Error updating targets:', error); return }
    } else {
      const { data, error } = await supabase
        .from('fitness_targets')
        .insert({ calorie_target: next.calorieTarget, protein_target: next.proteinTarget })
        .select()
        .single()
      if (error) { console.error('Error creating targets:', error); return }
      setTargetsId(data.id)
    }
    setTargets(next)
  }

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein:  acc.protein + m.protein,
      carbs:    acc.carbs + m.carbs,
      fat:      acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const caloriePct = Math.min(100, Math.round((totals.calories / targets.calorieTarget) * 100))
  const proteinPct = targets.proteinTarget > 0
    ? Math.min(100, Math.round((totals.protein / targets.proteinTarget) * 100))
    : 0

  // Most recent training timestamp per muscle (epoch ms) — drives recovery colors
  const lastTrained = {}
  for (const w of workouts) {
    const ts = new Date(w.createdAt).getTime()
    if (Number.isNaN(ts)) continue
    for (const m of w.muscles) {
      if (!lastTrained[m] || ts > lastTrained[m]) lastTrained[m] = ts
    }
  }

  const recentWorkouts = workouts.filter(w => w.loggedOn >= weekAgo)

  function formatLogged(iso) {
    if (iso === today) return 'Today'
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div className="fitness-page page-enter">
      <div className="fitness-header">
        <div>
          <h2>Fitness</h2>
          <span className="fitness-date">
            {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div className="fitness-actions">
          <button className="log-workout-btn press" onClick={() => setShowWorkoutModal(true)}>
            <Dumbbell size={15} /> Log Workout
          </button>
          <button className="add-meal-btn press" onClick={() => setShowMealModal(true)}>+ Log Meal</button>
        </div>
      </div>

      {/* Training — muscle map + workout log */}
      <div className="training-card">
        <span className="fitness-section-label">Muscle recovery</span>
        <BodyMap lastTrained={lastTrained} now={now} />

        <div className="workout-log">
          {recentWorkouts.length === 0 ? (
            <p className="workout-empty">No workouts logged this week. Hit “Log Workout” to light up some muscles.</p>
          ) : (
            recentWorkouts.map((w, i) => (
              <div key={w.id} className="workout-row stagger-item" style={{ '--i': i }}>
                <div className="workout-info">
                  <span className="workout-name">{w.name}</span>
                  <div className="workout-muscles">
                    {w.muscles.map(m => (
                      <span key={m} className="workout-muscle-tag">{muscleLabel(m)}</span>
                    ))}
                  </div>
                </div>
                <span className="workout-date">{formatLogged(w.loggedOn)}</span>
                <button
                  className="workout-delete-btn"
                  onClick={() => handleDeleteWorkout(w.id)}
                  title="Delete workout"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Daily nutrition targets */}
      <div className="fitness-targets-card">
        <div className="fitness-targets-top">
          <span className="fitness-section-label">Today's Targets</span>
          <button
            className="targets-edit-btn"
            onClick={() => setShowTargetsModal(true)}
            title="Edit targets"
          >
            <Settings size={15} />
          </button>
        </div>

        <div className="target-stat">
          <div className="target-stat-head">
            <span className="target-stat-name">Calories</span>
            <span className="target-stat-val">
              {totals.calories} <span className="target-stat-goal">/ {targets.calorieTarget} kcal</span>
            </span>
          </div>
          <div className="fitness-progress-bar">
            <div
              className="fitness-progress-fill fill-animated"
              style={{ width: `${caloriePct}%`, background: '#4ade80' }}
            />
          </div>
        </div>

        <div className="target-stat">
          <div className="target-stat-head">
            <span className="target-stat-name">Protein</span>
            <span className="target-stat-val">
              {totals.protein} <span className="target-stat-goal">/ {targets.proteinTarget} g</span>
            </span>
          </div>
          <div className="fitness-progress-bar">
            <div
              className="fitness-progress-fill fill-animated"
              style={{ width: `${proteinPct}%`, background: '#60a5fa' }}
            />
          </div>
        </div>

        <div className="macro-summary">
          <span><strong>{totals.carbs}</strong>g carbs</span>
          <span><strong>{totals.fat}</strong>g fat</span>
        </div>
      </div>

      {/* Meal log */}
      <div className="meals-section">
        <span className="fitness-section-label">Meals</span>
        <div className="meals-list">
          {meals.length === 0 && (
            <p className="meals-empty">No meals logged today.</p>
          )}
          {meals.map((meal, i) => (
            <div key={meal.id} className="meal-card stagger-item" style={{ '--i': i }}>
              <div className="meal-info">
                <span className="meal-name">{meal.name}</span>
                <span className="meal-macros">
                  {meal.protein}p · {meal.carbs}c · {meal.fat}f
                </span>
              </div>
              <span className="meal-calories">{meal.calories} <span>kcal</span></span>
              <button
                className="meal-delete-btn"
                onClick={() => handleDeleteMeal(meal.id)}
                title="Delete meal"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showMealModal && (
        <AddMealModal onAdd={handleAddMeal} onClose={() => setShowMealModal(false)} />
      )}

      {showTargetsModal && (
        <EditTargetsModal
          targets={targets}
          onSave={handleSaveTargets}
          onClose={() => setShowTargetsModal(false)}
        />
      )}

      {showWorkoutModal && (
        <AddWorkoutModal onAdd={handleAddWorkout} onClose={() => setShowWorkoutModal(false)} />
      )}
    </div>
  )
}
