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
            <p>Nossa missão é transformar operações manuais em máquinas de crescimento — redefinindo produtividade de <em>fazer mais</em> para <em>fazer melhor</em>.</p>
          </Reveal>
          <Reveal delay={0.4}>
            <p>Seus melhores momentos no trabalho são quando você está criando valor para clientes, não preenchendo planilhas.</p>
          </Reveal>
          <Reveal delay={0.6}>
            <p>A Avello existe para isso. Uma ferramenta integrada com a forma como seu negócio realmente funciona.</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
