import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Reveal: fade up from below */
export function revealUp(el, { delay = 0, duration = 1, y = 60 } = {}) {
  gsap.fromTo(el,
    { y, autoAlpha: 0 },
    {
      y: 0, autoAlpha: 1, duration, delay,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    }
  )
}

/** Split-text rotate in (Dala-style) */
export function splitTextRotateIn(el, { delay = 0, duration = 1, rotate = 3 } = {}) {
  const inner = el.querySelector('.reveal-text__inner')
  if (!inner) return
  gsap.fromTo(inner,
    { yPercent: 105, rotate },
    {
      yPercent: 0, rotate: 0, duration, delay,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    }
  )
}

/** Batch-reveal children with stagger */
export function staggerReveal(container, selector, { delay = 0, stagger = 0.15, y = 50 } = {}) {
  const els = container.querySelectorAll(selector)
  if (!els.length) return
  gsap.fromTo(els,
    { y, autoAlpha: 0 },
    {
      y: 0, autoAlpha: 1, duration: 1, delay, stagger,
      ease: 'expo.out',
      scrollTrigger: { trigger: container, start: 'top 85%', once: true },
    }
  )
}
