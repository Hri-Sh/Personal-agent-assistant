import './BodyMap.css'
import {
  MUSCLE_GROUPS, muscleLabel,
  RECOVERY_STAGES, UNTRAINED_STAGE, recoveryFor, timeAgo,
} from '../lib/muscles'

/* Anatomical front/back figures, workout-tracker style:
   solid dark silhouette, individual muscles as outlined shapes whose
   color reflects RECOVERY STATE (red = just trained → orange → green),
   with a legend above and a per-muscle "last trained x ago" list below.

   Symmetric muscles are authored once for the LEFT half (x < 120) and
   mirrored to the right with a scale(-1,1) transform. Midline muscles
   (abs, traps, lower-back) are drawn once, centered. */

const W = 240

// Shared structural silhouette — solid dark body behind the muscles
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
  'M52 268 C48 280 50 290 58 292 C66 294 72 288 70 278 L70 268 Z',                       // hand
  'M88 278 C82 306 84 344 100 372 L118 372 L118 282 C110 276 96 272 88 278 Z',           // thigh
  'M96 388 C90 412 91 440 106 458 L118 458 L118 392 C110 388 102 386 96 388 Z',          // lower leg
  'M98 456 C92 466 96 472 108 472 L117 468 L118 458 Z',                                  // foot
]

// ── FRONT muscles ──
// [group, path] — several paths can share one group (they recover together)
const FRONT_SIDE = [
  ['traps',     'M96 96 C104 91 112 90 117 93 L117 102 C108 99 100 102 95 106 Z'],
  ['shoulders', 'M52 118 C50 104 62 96 78 100 C88 103 94 114 92 126 C90 137 78 142 66 140 C56 138 53 128 52 118 Z'],
  ['chest',     'M116 106 C102 101 90 106 85 116 C80 126 83 141 94 149 C104 156 116 153 117 143 Z'],
  ['biceps',    'M60 130 C54 146 54 172 60 194 C64 202 74 201 78 193 C82 174 80 148 74 132 C70 125 63 124 60 130 Z'],
  ['forearms',  'M60 200 C54 218 53 244 58 266 C62 275 73 273 76 264 C80 242 78 216 72 202 C68 195 63 194 60 200 Z'],
  ['obliques',  'M100 156 C92 162 89 192 94 222 C97 232 106 233 107 224 L107 160 C107 154 103 153 100 156 Z'],
  ['quads',     'M114 280 C99 280 87 298 87 330 C87 353 97 372 110 372 C117 372 118 362 118 352 L118 284 C118 280 117 279 114 280 Z'],
  ['calves',    'M112 392 C102 394 96 414 96 434 C96 448 104 456 112 456 C117 456 118 448 118 440 L118 396 C118 392 116 391 112 392 Z'],
]
const FRONT_CENTER = [
  ['abs', 'M104 156 C104 150 112 149 120 149 C128 149 136 150 136 156 C137 176 136 210 130 232 C127 240 124 244 120 244 C116 244 113 240 110 232 C104 210 103 176 104 156 Z'],
]
// stroke-only seams that make big muscle blocks read as real anatomy
const FRONT_DETAIL = [
  'M120 152 V242',                       // abs center line
  'M105 170 H135', 'M105 188 H135', 'M106 207 H134', // ab rows
  'M120 96 V148',                        // sternum
  'M103 288 C99 314 99 342 104 366',     // quad seam (left; mirrored)
  'M66 136 C64 150 64 166 66 182',       // biceps/outer-arm seam
]

// ── BACK muscles ──
const BACK_SIDE = [
  ['shoulders', 'M52 118 C50 104 62 96 78 100 C88 103 94 114 92 126 C90 137 78 142 66 140 C56 138 53 128 52 118 Z'],
  ['triceps',   'M60 130 C54 146 54 172 60 194 C64 202 74 201 78 193 C82 174 80 148 74 132 C70 125 63 124 60 130 Z'],
  ['forearms',  'M60 200 C54 218 53 244 58 266 C62 275 73 273 76 264 C80 242 78 216 72 202 C68 195 63 194 60 200 Z'],
  ['lats',      'M114 118 C99 118 89 131 89 151 C89 170 100 187 112 191 C118 192 118 184 118 176 L118 122 C118 118 116 117 114 118 Z'],
  ['glutes',    'M116 244 C103 242 93 251 93 264 C93 279 106 287 116 285 C119 284 119 272 119 262 L119 248 C119 245 118 244 116 244 Z'],
  ['hamstrings','M114 288 C99 288 89 306 89 334 C89 357 99 372 112 372 C118 372 119 362 119 352 L119 292 C119 288 117 287 114 288 Z'],
  ['calves',    'M112 390 C101 392 95 412 96 434 C97 448 105 456 113 455 C118 454 119 446 119 438 L119 394 C119 390 116 389 112 390 Z'],
]
const BACK_CENTER = [
  ['traps',      'M120 90 C102 92 94 102 96 112 C110 120 110 150 120 158 C130 150 130 120 144 112 C146 102 138 92 120 90 Z'],
  ['lower-back', 'M106 192 C112 190 128 190 134 192 C136 206 130 222 120 222 C110 222 104 206 106 192 Z'],
]
const BACK_DETAIL = [
  'M120 96 V156',                        // spine through traps
  'M104 296 C100 318 100 344 105 366',   // hamstring seam (mirrored)
  'M104 132 C100 148 100 166 105 182',   // lat sweep line
]

function Muscle({ muscle, d, stageOf, lastTrained, now }) {
  const stage = stageOf(muscle)
  return (
    <path d={d} className={`muscle stage-${stage.key}`} style={{ fill: stage.color }}>
      <title>
        {muscleLabel(muscle)} — {stage.key === 'untrained' ? 'not trained yet' : `${stage.label.toLowerCase()}, ${timeAgo(lastTrained[muscle], now)}`}
      </title>
    </path>
  )
}

function Figure({ side, center, detail, stageOf, lastTrained, now, label }) {
  const mirror = `translate(${W},0) scale(-1,1)`
  const muscleProps = { stageOf, lastTrained, now }
  return (
    <div className="body-figure">
      <svg viewBox="0 0 240 480" xmlns="http://www.w3.org/2000/svg">
        {/* solid silhouette base */}
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
          {side.map(([m, d]) => <Muscle key={`l-${m}-${d.slice(0, 8)}`} muscle={m} d={d} {...muscleProps} />)}
          <g transform={mirror}>
            {side.map(([m, d]) => <Muscle key={`r-${m}-${d.slice(0, 8)}`} muscle={m} d={d} {...muscleProps} />)}
          </g>
          {center.map(([m, d]) => <Muscle key={`c-${m}`} muscle={m} d={d} {...muscleProps} />)}
        </g>

        {/* anatomy seam lines on top */}
        <g className="body-detail">
          {detail.map((d, i) => <path key={`d${i}`} d={d} />)}
          <g transform={mirror}>
            {detail.map((d, i) => <path key={`dm${i}`} d={d} />)}
          </g>
        </g>
      </svg>
      <span className="body-figure-label">{label}</span>
    </div>
  )
}

export default function BodyMap({ lastTrained = {}, now = Date.now() }) {
  const stageOf = m => recoveryFor(lastTrained[m], now)

  // Trained muscles first (most recent on top), untrained at the end
  const rows = MUSCLE_GROUPS
    .map(m => ({ m, last: lastTrained[m] ?? null, stage: stageOf(m) }))
    .sort((a, b) => (b.last ?? 0) - (a.last ?? 0))

  const figureProps = { stageOf, lastTrained, now }

  return (
    <div className="body-map-wrap">
      <div className="body-legend">
        {RECOVERY_STAGES.map(s => (
          <span key={s.key} className="legend-item">
            <span className="legend-dot" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="body-map">
        <Figure side={FRONT_SIDE} center={FRONT_CENTER} detail={FRONT_DETAIL} {...figureProps} label="Front" />
        <Figure side={BACK_SIDE} center={BACK_CENTER} detail={BACK_DETAIL} {...figureProps} label="Back" />
      </div>

      <div className="muscle-recovery-list">
        {rows.map(({ m, last, stage }, i) => (
          <div key={m} className={`recovery-row stagger-item ${last ? '' : 'untrained'}`} style={{ '--i': i }}>
            <span
              className={`recovery-dot ${stage.key === 'fresh' ? 'fresh' : ''}`}
              style={{ background: last ? stage.color : UNTRAINED_STAGE.color }}
            />
            <span className="recovery-name">{muscleLabel(m)}</span>
            <span className="recovery-time">{timeAgo(last, now)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
