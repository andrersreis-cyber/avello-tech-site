import { useRef, useEffect } from 'react'
import { Reveal } from './Reveal'
import { staggerReveal } from '../lib/animations'

const stats = [
  { num: 'R$ 847.000', label: 'em retrabalho eliminados nos últimos 12 meses' },
  { num: '73%', label: 'de redução no tempo de ciclo de aprovação' },
  { num: '11→2 dias', label: 'no processo de orçamento' },
]

export function ProofSection() {
  const gridRef = useRef(null)

  useEffect(() => {
    if (!gridRef.current) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return
    const raf = requestAnimationFrame(() => {
      staggerReveal(gridRef.current, '.proof__item', { stagger: 0.12 })
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section id="resultados" className="proof">
      <Reveal>
        <h2 className="intro__title">Números que falam.</h2>
      </Reveal>
      <div className="proof__grid" ref={gridRef}>
        {stats.map((s, i) => (
          <div key={i} className="proof__item" style={{ opacity: 0, visibility: 'hidden' }}>
            <span className="proof__num">{s.num}</span>
            <span className="proof__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
