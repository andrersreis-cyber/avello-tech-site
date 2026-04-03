import { Reveal } from './Reveal'

export function ManifestoSolution() {
  return (
    <section className="manifesto-sec">
      <div className="manifesto-sec__inner">
        <Reveal>
          <h2 className="manifesto-sec__title">Chega de apagar incêndio.</h2>
        </Reveal>
        <div className="manifesto-sec__body">
          <Reveal delay={0.2}>
            <p>A Avello é sua fonte inteligente de verdade em tempo real que elimina as lutas culturais, financeiras e operacionais de ferramentas fragmentadas.</p>
          </Reveal>
          <Reveal delay={0.4}>
            <p>Conectamos seus sistemas nos bastidores e reunimos exatamente o conhecimento que você precisa em agentes autônomos que trabalham 24 horas.</p>
          </Reveal>
          <Reveal delay={0.6}>
            <p>Simplesmente peça à Avello a resposta que avança seu trabalho e te ajuda a tomar decisões melhores com mais confiança.</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
