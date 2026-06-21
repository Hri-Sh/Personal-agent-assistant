import { useState, useEffect } from 'react'
import { Trash2, Settings } from 'lucide-react'
import './Fitness.css'
import AddMealModal from '../components/AddMealModal'
import EditTargetsModal from '../components/EditTargetsModal'
import { supabase } from '../lib/supabase'

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

const DEFAULT_TARGETS = { calorieTarget: 2000, proteinTarget: 150 }

export default function Fitness() {
  const today = new Date().toLocaleDateString('en-CA') // 'YYYY-MM-DD'
  const [meals, setMeals] = useState([])
  const [targets, setTargets] = useState(DEFAULT_TARGETS)
  const [targetsId, setTargetsId] = useState(null)
  const [showMealModal, setShowMealModal] = useState(false)
  const [showTargetsModal, setShowTargetsModal] = useState(false)

  // Load today's meals + targets on mount
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
  }, [today])

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

  return (
    <div className="fitness-page">
      <div className="fitness-header">
        <div>
          <h2>Fitness</h2>
          <span className="fitness-date">
            {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <button className="add-meal-btn" onClick={() => setShowMealModal(true)}>+ Log Meal</button>
      </div>

      {/* Daily targets */}
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
              className="fitness-progress-fill"
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
              className="fitness-progress-fill"
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
          {meals.map(meal => (
            <div key={meal.id} className="meal-card">
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
    </div>
  )
}
