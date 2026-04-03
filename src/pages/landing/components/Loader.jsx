import { useEffect, useState } from 'react'

export function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let p = 0
    const id = setInterval(() => {
      p += Math.random() * 18 + 2
      if (p >= 100) {
        p = 100
        clearInterval(id)
        setTimeout(() => { setDone(true); onComplete?.() }, 500)
      }
      setProgress(Math.round(p))
    }, 120)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`loader ${done ? 'is-done' : ''}`}>
      <div className="loader__text">
        Sua empresa tem a resposta.<br />A Avello vai encontrá-la.
      </div>
      <div className="loader__progress">{progress}</div>
      <div className="loader__label">{progress < 100 ? 'Carregando...' : 'Pronto'}</div>
    </div>
  )
}
