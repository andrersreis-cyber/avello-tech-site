import { useGsapReveal } from '../hooks/useGsapReveal'

/** Fade-up reveal block */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useGsapReveal('up', { delay })
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ opacity: 0, visibility: 'hidden' }}>
      {children}
    </Tag>
  )
}

/** Split-text rotate-in reveal (Dala-style) */
export function RevealText({ children, className = '', delay = 0, as: Tag = 'span' }) {
  const ref = useGsapReveal('text', { delay })
  return (
    <Tag ref={ref} className={`reveal-text ${className}`}>
      <span className="reveal-text__inner">{children}</span>
    </Tag>
  )
}
