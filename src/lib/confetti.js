/* Tiny dependency-free confetti.
   Usage:  import { fireConfetti } from '../lib/confetti'
           fireConfetti()                       // center burst
           fireConfetti({ origin: el })         // burst from an element
           fireConfetti({ x, y, count, colors }) */

const COLORS = ['#4ade80', '#60a5fa', '#f87171', '#a78bfa', '#fb923c', '#fde047', '#f5f5f5']

let canvas = null
let ctx = null
let particles = []
let rafId = null

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function ensureCanvas() {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;'
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
}

function resize() {
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function spawn({ x, y, count, colors, power, spread }) {
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread
    const speed = power * (0.5 + Math.random())
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.4,
      size: 5 + Math.random() * 6,
      color: colors[(Math.random() * colors.length) | 0],
      life: 1,
      decay: 0.008 + Math.random() * 0.01,
      round: Math.random() > 0.6,
    })
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (const p of particles) {
    p.vy += 0.16          // gravity
    p.vx *= 0.99          // drag
    p.x += p.vx
    p.y += p.vy
    p.rot += p.vrot
    p.life -= p.decay

    ctx.save()
    ctx.globalAlpha = Math.max(0, p.life)
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.fillStyle = p.color
    if (p.round) {
      ctx.beginPath()
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
    }
    ctx.restore()
  }

  particles = particles.filter(p => p.life > 0 && p.y < window.innerHeight + 40)

  if (particles.length > 0) {
    rafId = requestAnimationFrame(loop)
  } else {
    cancelAnimationFrame(rafId)
    rafId = null
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

export function fireConfetti(opts = {}) {
  if (prefersReducedMotion()) return
  ensureCanvas()
  resize()

  let { x, y, origin, count = 90, colors = COLORS, power = 11, spread = 1.4 } = opts

  if (origin && origin.getBoundingClientRect) {
    const r = origin.getBoundingClientRect()
    x = r.left + r.width / 2
    y = r.top + r.height / 2
  }
  if (x == null) x = window.innerWidth / 2
  if (y == null) y = window.innerHeight / 2.6

  spawn({ x, y, count, colors, power, spread })

  if (!rafId) rafId = requestAnimationFrame(loop)
}
