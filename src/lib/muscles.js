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

// A few handy presets so logging a workout is fast.
export const WORKOUT_PRESETS = [
  { name: 'Push', muscles: ['chest', 'shoulders', 'triceps'] },
  { name: 'Pull', muscles: ['lats', 'biceps', 'traps', 'forearms'] },
  { name: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
  { name: 'Core', muscles: ['abs', 'obliques', 'lower-back'] },
  { name: 'Upper', muscles: ['chest', 'lats', 'shoulders', 'biceps', 'triceps'] },
]
