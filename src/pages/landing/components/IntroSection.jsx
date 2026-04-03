import { Reveal } from './Reveal'

export function IntroSection() {
  return (
    <section className="section section--tall section--center">
      <Reveal>
        <h2 className="intro__title">Tome decisões com confiança</h2>
      </Reveal>
      <Reveal delay={0.3}>
        <p className="intro__body">
          Nossa tecnologia de IA automatiza a extração de conhecimento de toda a sua operação
          para que você elimine a adivinhação do seu trabalho.
        </p>
      </Reveal>
    </section>
  )
}
