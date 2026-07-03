import './BodyMap.css'
import { muscleLabel } from '../lib/muscles'

/* Anatomical front/back figures.
   Symmetric muscles are authored once for the LEFT half (x < 120) and
   mirrored to the right with a scale(-1,1) transform. Midline muscles
   (abs, traps, lower-back) are drawn once, centered.
   `intensity` maps muscle -> times trained; brighter = more volume. */

const W = 240

// Shared structural silhouette (muted) — reused by both views
const BASE_CENTER = [
  // neck
  'M110 66 H130 V90 C130 96 110 96 110 90 Z',
  // torso
  'M92 100 C110 92 130 92 148 100 C156 118 156 150 150 178 C146 205 140 236 120 250 C100 236 94 205 90 178 C84 150 84 118 92 100 Z',
  // pelvis / hips
  'M96 240 C104 236 136 236 144 240 C148 258 140 278 120 278 C100 278 92 258 96 240 Z',
]
const BASE_SIDE = [
  'M56 116 C50 140 50 172 58 198 L78 196 C74 168 74 140 78 118 C72 110 62 110 56 116 Z', // upper arm
  'M56 200 C51 224 51 250 58 270 L76 268 C73 244 73 218 74 202 C68 196 61 196 56 200 Z', // forearm
  'M88 278 C82 306 84 344 100 372 L118 372 L118 282 C110 276 96 272 88 278 Z',           // thigh
  'M96 388 C90 412 91 440 106 458 L118 458 L118 392 C110 388 102 386 96 388 Z',           // lower leg
  'M98 456 C96 467 114 468 117 461 L118 456 Z',                                            // foot
]

// ── FRONT muscles ──
const FRONT_SIDE = [
  ['shoulders', 'M52 118 C50 104 62 96 78 100 C88 103 94 114 92 126 C90 137 78 142 66 140 C56 138 53 128 52 118 Z'],
  ['chest',     'M116 106 C104 102 92 106 86 116 C82 124 84 140 94 148 C104 155 116 152 116 143 Z'],
  ['biceps',    'M60 130 C54 146 54 172 60 194 C64 202 74 201 78 193 C82 174 80 148 74 132 C70 125 63 124 60 130 Z'],
  ['forearms',  'M60 200 C54 218 53 244 58 266 C62 275 73 273 76 264 C80 242 78 216 72 202 C68 195 63 194 60 200 Z'],
  ['obliques',  'M100 156 C92 162 89 192 94 222 C97 232 106 233 107 224 L107 160 C107 154 103 153 100 156 Z'],
  ['quads',     'M114 280 C100 280 88 298 88 330 C88 352 98 372 110 372 C117 372 118 362 118 352 L118 284 C118 280 117 279 114 280 Z'],
  ['calves',    'M112 392 C102 394 96 414 96 434 C96 448 104 456 112 456 C117 456 118 448 118 440 L118 396 C118 392 116 391 112 392 Z'],
]
const FRONT_CENTER = [
  ['abs', 'M104 156 C104 150 112 149 120 149 C128 149 136 150 136 156 C137 176 136 210 130 232 C127 240 124 244 120 244 C116 244 113 240 110 232 C104 210 103 176 104 156 Z'],
]

// ── BACK muscles ──
const BACK_SIDE = [
  ['shoulders', 'M52 118 C50 104 62 96 78 100 C88 103 94 114 92 126 C90 137 78 142 66 140 C56 138 53 128 52 118 Z'],
  ['triceps',   'M60 130 C54 146 54 172 60 194 C64 202 74 201 78 193 C82 174 80 148 74 132 C70 125 63 124 60 130 Z'],
  ['forearms',  'M60 200 C54 218 53 244 58 266 C62 275 73 273 76 264 C80 242 78 216 72 202 C68 195 63 194 60 200 Z'],
  ['lats',      'M114 118 C100 118 90 130 90 150 C90 168 100 186 112 190 C118 191 118 184 118 176 L118 122 C118 118 116 117 114 118 Z'],
  ['glutes',    'M116 244 C104 242 94 250 94 264 C94 278 106 286 116 284 C119 283 119 272 119 262 L119 248 C119 245 118 244 116 244 Z'],
  ['hamstrings','M114 288 C100 288 90 306 90 334 C90 356 100 372 112 372 C118 372 119 362 119 352 L119 292 C119 288 117 287 114 288 Z'],
  ['calves',    'M112 390 C101 392 95 412 96 434 C97 448 105 456 113 455 C118 454 119 446 119 438 L119 394 C119 390 116 389 112 390 Z'],
]
const BACK_CENTER = [
  ['traps',      'M120 90 C102 92 94 102 96 112 C110 120 110 150 120 158 C130 150 130 120 144 112 C146 102 138 92 120 90 Z'],
  ['lower-back', 'M106 192 C112 190 128 190 134 192 C136 206 130 222 120 222 C110 222 104 206 106 192 Z'],
]

const RAMP = [
  'rgba(245, 245, 245, 0.05)', // 0 — untrained
  'rgba(74, 222, 128, 0.40)',  // 1
  'rgba(74, 222, 128, 0.70)',  // 2
  '#4ade80',                   // 3+
]
const fillFor = c => RAMP[Math.min(c, 3)]

function Muscle({ muscle, d, intensity }) {
  const count = intensity[muscle] ?? 0
  return (
    <path d={d} className={`muscle ${count > 0 ? 'active' : ''}`} style={{ fill: fillFor(count) }}>
      <title>{muscleLabel(muscle)}{count > 0 ? ` — trained ${count}×` : ''}</title>
    </path>
  )
}

function Figure({ side, center, intensity, label }) {
  const mirror = `translate(${W},0) scale(-1,1)`
  return (
    <div className="body-figure">
      <svg viewBox="0 0 240 480" xmlns="http://www.w3.org/2000/svg">
        {/* structural base */}
        <g className="body-base">
          <circle cx="120" cy="44" r="26" />
          {BASE_CENTER.map((d, i) => <path key={`bc${i}`} d={d} />)}
          {BASE_SIDE.map((d, i) => <path key={`bl${i}`} d={d} />)}
          <g transform={mirror}>
            {BASE_SIDE.map((d, i) => <path key={`br${i}`} d={d} />)}
          </g>
        </g>

        {/* muscles: left, mirrored right, then center */}
        <g className="body-muscles">
          {side.map(([m, d]) => <Muscle key={`l-${m}`} muscle={m} d={d} intensity={intensity} />)}
          <g transform={mirror}>
            {side.map(([m, d]) => <Muscle key={`r-${m}`} muscle={m} d={d} intensity={intensity} />)}
          </g>
          {center.map(([m, d]) => <Muscle key={`c-${m}`} muscle={m} d={d} intensity={intensity} />)}
        </g>
      </svg>
      <span className="body-figure-label">{label}</span>
    </div>
  )
}

export default function BodyMap({ intensity = {} }) {
  return (
    <div className="body-map">
      <Figure side={FRONT_SIDE} center={FRONT_CENTER} intensity={intensity} label="Front" />
      <Figure side={BACK_SIDE} center={BACK_CENTER} intensity={intensity} label="Back" />
    </div>
  )
}
