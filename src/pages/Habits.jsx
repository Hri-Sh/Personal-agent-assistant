import './Habits.css'

const MOCK_HABITS = [
  { id: 1, name: 'Morning Run',   frequency: 'daily',    color: '#4ade80', completedDates: [] },
  { id: 2, name: 'Read 20 mins',  frequency: 'daily',    color: '#60a5fa', completedDates: [] },
  { id: 3, name: 'Gym',           frequency: 'weekdays', color: '#f87171', completedDates: [] },
  { id: 4, name: 'Weekly Review', frequency: 'weekly',   color: '#a78bfa', completedDates: [] },
  { id: 5, name: 'Meal Prep',     frequency: 'weekly',   color: '#fb923c', completedDates: [] },
]

export default function Habits() {
  const today = new Date().toLocaleDateString('en-CA') // gives 'YYYY-MM-DD'

  return (
    <div className="habits-page">
      <div className="habits-header">
        <div>
          <h2>Habits</h2>
          <span className="habits-date">{<span className="habits-date">
  {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
</span>}</span>
        </div>
        <button className="add-habit-btn">+ Add Habit</button>
      </div>

      <div className="habits-list">
        {MOCK_HABITS.map(habit => (
          <div key={habit.id} className="habit-card">
            <div className="habit-color-dot" style={{ background: habit.color }} />
            <div className="habit-info">
              <span className="habit-name">{habit.name}</span>
              <span className="habit-frequency">{habit.frequency}</span>
            </div>
            <div className="habit-streak">🔥 0</div>
            <input type="checkbox" className="habit-check" />
          </div>
        ))}
      </div>
    </div>
  )
}