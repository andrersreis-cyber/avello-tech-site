import { Reveal } from './Reveal'

export function ManifestoSolution() {
  return (
    <section className="manifesto-sec">
      <div className="manifesto-sec__inner">
        <Reveal>
          <h2 className="manifesto-sec__title">Chega de gerir no achismo.</h2>
        </Reveal>
        <div className="manifesto-sec__body">
          <Reveal delay={0.2}>
            <p>A Avello conecta seus sistemas nos bastidores. CRM, WhatsApp, ERP, planilhas — tudo conversando em tempo real, sem você precisar tocar.</p>
          </Reveal>
          <Reveal delay={0.4}>
            <p>Nossos agentes de IA atendem leads 24h, qualificam contatos e disparam follow-ups. Sem pausar. Sem esquecer. Sem férias.</p>
          </Reveal>
          <Reveal delay={0.6}>
            <p>Dashboards em tempo real mostram exatamente onde está o dinheiro, onde está o gargalo, e o que fazer agora.</p>
          </Reveal>
          <Reveal delay={0.8}>
            <p>Não é automação. É um ecossistema de agentes que pensa, age e aprende — enquanto você foca no que importa.</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
