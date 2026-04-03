import { Reveal, RevealText } from './Reveal'

export function HeroSection() {
  return (
    <section className="section" data-section="hero">
      <h1>
        <RevealText className="hero__title" delay={0.2}>Sua operação</RevealText>
        <RevealText className="hero__title" delay={0.4}>no piloto</RevealText>
        <RevealText className="hero__title" delay={0.6}>automático.</RevealText>
      </h1>
      <Reveal delay={1}>
        <div className="hero__sub">Automação com IA que trabalha enquanto você dorme.</div>
      </Reveal>
      <Reveal delay={1.2}>
        <p className="hero__body">
          Conecte-se ao poder da inteligência artificial. A Avello cria agentes autônomos,
          integrações e dashboards que eliminam trabalho manual e aceleram suas decisões.
        </p>
      </Reveal>
      <Reveal className="hero__cta" delay={1.4}>
        <button
          className="av-btn"
          onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Quero um diagnóstico gratuito
        </button>
      </Reveal>
    </section>
  )
}
