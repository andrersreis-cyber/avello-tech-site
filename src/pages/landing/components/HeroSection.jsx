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
        <div className="hero__sub">Agentes de IA, integrações e dashboards que trabalham enquanto você dorme.</div>
      </Reveal>
      <Reveal delay={1.2}>
        <p className="hero__body">
          A Avello constrói automações inteligentes que eliminam 30 horas semanais
          de trabalho manual. Sem contratar. Sem treinar. Sem esperar.
        </p>
      </Reveal>
      <Reveal className="hero__cta" delay={1.4}>
        <button
          className="av-btn av-btn--primary"
          onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Agendar diagnóstico gratuito
        </button>
        <a className="av-btn" href="#solucoes" style={{marginLeft: 16}}>Ver como funciona</a>
      </Reveal>
    </section>
  )
}
