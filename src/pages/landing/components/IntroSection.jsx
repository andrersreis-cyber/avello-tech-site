import { Reveal } from './Reveal'

export function IntroSection() {
  return (
    <section className="section section--tall section--center" id="solucoes">
      <Reveal>
        <h2 className="intro__title">Cada decisão manual te custa dinheiro.</h2>
      </Reveal>
      <Reveal delay={0.3}>
        <p className="intro__body">
          Enquanto sua equipe copia planilhas, responde leads no braço e monta relatórios,
          seus concorrentes já automatizaram. A Avello fecha essa lacuna em 30 dias.
        </p>
      </Reveal>
    </section>
  )
}
