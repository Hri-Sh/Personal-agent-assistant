// Canonical muscle groups shared by the workout modal and the body map.

export const MUSCLE_GROUPS = [
  'chest', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'obliques', 'lats', 'traps', 'lower-back',
  'quads', 'hamstrings', 'glutes', 'calves',
]

const LABELS = {
  'lower-back': 'Lower Back',
}

export function muscleLabel(m) {
  return LABELS[m] ?? m.charAt(0).toUpperCase() + m.slice(1)
}

// ── Recovery model ──────────────────────────────────────────
// A muscle's state is driven by time since it was last trained.

export const RECOVERY_STAGES = [
  { key: 'fresh',      label: 'Just trained', color: '#f87171', maxHours: 24 },
  { key: 'recovering', label: 'Recovering',   color: '#fb923c', maxHours: 60 },
  { key: 'rested',     label: 'Rested',       color: '#4ade80', maxHours: Infinity },
]

export const UNTRAINED_STAGE = { key: 'untrained', label: 'Not trained yet', color: '#2b2f36' }

// lastMs = epoch ms of the muscle's most recent workout (or null/undefined)
export function recoveryFor(lastMs, nowMs = Date.now()) {
  if (!lastMs) return UNTRAINED_STAGE
  const hours = (nowMs - lastMs) / 3600000
  return RECOVERY_STAGES.find(s => hours < s.maxHours) ?? RECOVERY_STAGES[RECOVERY_STAGES.length - 1]
}

// "33 min ago" / "5 hr, 12 min ago" / "3 days ago"
export function timeAgo(lastMs, nowMs = Date.now()) {
  if (!lastMs) return 'Not trained yet'
  const mins = Math.floor((nowMs - lastMs) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) {
    const rem = mins % 60
    return rem > 0 ? `${hrs} hr, ${rem} min ago` : `${hrs} hr ago`
  }
  const days = Math.floor(hrs / 24)
  return days === 1 ? '1 day ago' : `${days} days ago`
}

// A few handy presets so logging a workout is fast.
export const WORKOUT_PRESETS = [
  { name: 'Push', muscles: ['chest', 'shoulders', 'triceps'] },
  { name: 'Pull', muscles: ['lats', 'biceps', 'traps', 'forearms'] },
  { name: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
  { name: 'Core', muscles: ['abs', 'obliques', 'lower-back'] },
  { name: 'Upper', muscles: ['chest', 'lats', 'shoulders', 'biceps', 'triceps'] },
]
