import { useEffect, useRef } from 'react'
import { revealUp, splitTextRotateIn } from '../lib/animations'

/**
 * Hook that applies a GSAP reveal animation to the ref element.
 * @param {'up'|'text'} type - animation preset
 * @param {object} opts - delay, duration, etc.
 */
export function useGsapReveal(type = 'up', opts = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1'
      el.style.visibility = 'visible'
      el.style.transform = 'none'
      const inner = el.querySelector('.reveal-text__inner')
      if (inner) inner.style.transform = 'none'
      return
    }

    // Small delay to ensure DOM is painted
    const raf = requestAnimationFrame(() => {
      if (type === 'text') splitTextRotateIn(el, opts)
      else revealUp(el, opts)
    })

    return () => cancelAnimationFrame(raf)
  }, [])

  return ref
}
