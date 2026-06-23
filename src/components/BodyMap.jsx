import './BodyMap.css'
import { muscleLabel } from '../lib/muscles'

/* Stylized front/back figures built from rounded rects.
   `intensity` is a map of muscle -> times trained in the window.
   Muscles light up brighter the more they've been hit. */

// Structural (non-muscle) shapes shared by both views
const BASE = {
  head: { cx: 100, cy: 28, r: 18 },
  neck: { x: 91, y: 44, w: 18, h: 12, rx: 5 },
  pelvis: { x: 74, y: 150, w: 52, h: 22, rx: 10 },
  kneeL: { x: 71, y: 244, w: 26, h: 12, rx: 6 },
  kneeR: { x: 103, y: 244, w: 26, h: 12, rx: 6 },
  footL: { x: 72, y: 314, w: 24, h: 14, rx: 5 },
  footR: { x: 104, y: 314, w: 24, h: 14, rx: 5 },
}

// Muscle rects: [muscle, x, y, w, h, rx]
const FRONT = [
  ['shoulders', 40, 58, 32, 22, 11],
  ['shoulders', 128, 58, 32, 22, 11],
  ['chest', 66, 62, 32, 30, 10],
  ['chest', 102, 62, 32, 30, 10],
  ['biceps', 40, 84, 26, 44, 12],
  ['biceps', 134, 84, 26, 44, 12],
  ['forearms', 38, 130, 24, 46, 11],
  ['forearms', 138, 130, 24, 46, 11],
  ['obliques', 66, 96, 12, 46, 6],
  ['obliques', 122, 96, 12, 46, 6],
  ['abs', 80, 96, 40, 52, 10],
  ['quads', 70, 174, 28, 68, 13],
  ['quads', 102, 174, 28, 68, 13],
  ['calves', 72, 258, 24, 56, 11],
  ['calves', 104, 258, 24, 56, 11],
]

const BACK = [
  ['shoulders', 40, 58, 32, 22, 11],
  ['shoulders', 128, 58, 32, 22, 11],
  ['traps', 78, 56, 44, 26, 12],
  ['triceps', 40, 84, 26, 44, 12],
  ['triceps', 134, 84, 26, 44, 12],
  ['forearms', 38, 130, 24, 46, 11],
  ['forearms', 138, 130, 24, 46, 11],
  ['lats', 66, 86, 30, 40, 10],
  ['lats', 104, 86, 30, 40, 10],
  ['lower-back', 80, 128, 40, 24, 10],
  ['glutes', 72, 154, 28, 30, 12],
  ['glutes', 100, 154, 28, 30, 12],
  ['hamstrings', 70, 186, 28, 56, 13],
  ['hamstrings', 102, 186, 28, 56, 13],
  ['calves', 72, 258, 24, 56, 11],
  ['calves', 104, 258, 24, 56, 11],
]

const RAMP = [
  'rgba(245, 245, 245, 0.05)', // 0 — untrained
  'rgba(74, 222, 128, 0.40)',  // 1
  'rgba(74, 222, 128, 0.70)',  // 2
  '#4ade80',                   // 3+
]

function fillFor(count) {
  return RAMP[Math.min(count, 3)]
}

function BaseShapes() {
  return (
    <g className="body-base">
      <circle cx={BASE.head.cx} cy={BASE.head.cy} r={BASE.head.r} />
      <rect x={BASE.neck.x} y={BASE.neck.y} width={BASE.neck.w} height={BASE.neck.h} rx={BASE.neck.rx} />
      <rect x={BASE.pelvis.x} y={BASE.pelvis.y} width={BASE.pelvis.w} height={BASE.pelvis.h} rx={BASE.pelvis.rx} />
      <rect x={BASE.kneeL.x} y={BASE.kneeL.y} width={BASE.kneeL.w} height={BASE.kneeL.h} rx={BASE.kneeL.rx} />
      <rect x={BASE.kneeR.x} y={BASE.kneeR.y} width={BASE.kneeR.w} height={BASE.kneeR.h} rx={BASE.kneeR.rx} />
      <rect x={BASE.footL.x} y={BASE.footL.y} width={BASE.footL.w} height={BASE.footL.h} rx={BASE.footL.rx} />
      <rect x={BASE.footR.x} y={BASE.footR.y} width={BASE.footR.w} height={BASE.footR.h} rx={BASE.footR.rx} />
    </g>
  )
}

function Figure({ shapes, intensity, label }) {
  return (
    <div className="body-figure">
      <svg viewBox="0 0 200 340" xmlns="http://www.w3.org/2000/svg">
        <BaseShapes />
        {shapes.map(([muscle, x, y, w, h, rx], i) => {
          const count = intensity[muscle] ?? 0
          return (
            <rect
              key={`${muscle}-${i}`}
              x={x} y={y} width={w} height={h} rx={rx}
              className={`muscle ${count > 0 ? 'active' : ''}`}
              style={{ fill: fillFor(count) }}
            >
              <title>{muscleLabel(muscle)}{count > 0 ? ` — trained ${count}×` : ''}</title>
            </rect>
          )
        })}
      </svg>
      <span className="body-figure-label">{label}</span>
    </div>
  )
}

export default function BodyMap({ intensity = {} }) {
  return (
    <div className="body-map">
      <Figure shapes={FRONT} intensity={intensity} label="Front" />
      <Figure shapes={BACK} intensity={intensity} label="Back" />
    </div>
  )
}
