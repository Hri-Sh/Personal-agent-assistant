import { useEffect, useRef, useState } from 'react'

// Animates a number from 0 up to `value` with an ease-out curve.
export default function CountUp({ value, duration = 850, className }) {
  const [n, setN] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setN(value); return }

    const start = performance.now()
    function tick(t) {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(value * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return <span className={className}>{n}</span>
}
