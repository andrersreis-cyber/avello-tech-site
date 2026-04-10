import { Reveal, RevealText } from './Reveal'

export function HeroSection() {
  return (
    <section className="section" data-section="hero">
      <h1>
        <RevealText className="hero__title" delay={0.2}>O caos muda</RevealText>
        <RevealText className="hero__title" delay={0.4}>de nicho. A causa</RevealText>
        <RevealText className="hero__title" delay={0.6}>é sempre a mesma.</RevealText>
      </h1>
      <Reveal delay={1}>
        <div className="hero__sub">Decisão sem dado. Processo sem estratégia. Operação no improviso.</div>
      </Reveal>
      <Reveal delay={1.2}>
        <p className="hero__body">
          Sua operação tem gaps que custam dinheiro todos os dias. A Avello identifica
          esses gaps e constrói sistemas que trabalham sozinhos — sem você precisar
          entender de tecnologia.
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
