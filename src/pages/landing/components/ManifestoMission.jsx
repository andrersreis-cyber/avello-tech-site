import { Reveal } from './Reveal'

export function ManifestoMission() {
  return (
    <section className="manifesto-sec manifesto-sec--right">
      <div className="manifesto-sec__inner">
        <Reveal>
          <h2 className="manifesto-sec__title">Construa um negócio que escala.</h2>
        </Reveal>
        <div className="manifesto-sec__body">
          <Reveal delay={0.2}>
            <p>Nossa missão é tornar o trabalho mais coerente e eficiente — redefinindo produtividade de <em>fazer mais</em> para <em>ser melhor</em>.</p>
          </Reveal>
          <Reveal delay={0.4}>
            <p>Seus momentos mais felizes e produtivos no trabalho são quando você está em flow, intelectualmente estimulado, e criando valor real para seus clientes.</p>
          </Reveal>
          <Reveal delay={0.6}>
            <p>Queremos recriar isso toda vez que você usa a Avello. Uma ferramenta completamente integrada com a forma como você pensa, sente e trabalha.</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
