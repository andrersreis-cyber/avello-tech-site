import { Reveal } from './Reveal'

export function ManifestoMission() {
  return (
    <section className="manifesto-sec manifesto-sec--right">
      <div className="manifesto-sec__inner">
        <Reveal>
          <h2 className="manifesto-sec__title">A Avello nasceu dentro de uma obra.</h2>
        </Reveal>
        <div className="manifesto-sec__body">
          <Reveal delay={0.2}>
            <p>Começamos resolvendo o caos da construção civil — orçamentos errados, gestão no WhatsApp, decisões tomadas sem dado nenhum.</p>
          </Reveal>
          <Reveal delay={0.4}>
            <p>Percebemos que o problema não era o setor. Era a ausência de inteligência no processo.</p>
          </Reveal>
          <Reveal delay={0.6}>
            <p><em>O caos é o mesmo em todo lugar. Só muda o endereço.</em></p>
          </Reveal>
          <Reveal delay={0.8}>
            <p>Hoje construímos ecossistemas de agentes autônomos para empresas de qualquer segmento que querem parar de improvisar — e começar a crescer com estratégia.</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
