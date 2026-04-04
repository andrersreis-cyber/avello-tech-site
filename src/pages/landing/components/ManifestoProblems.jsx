import { Reveal } from './Reveal'

const blocks = [
  [
    'Sua equipe perde 12 horas por semana em tarefas que uma IA resolve em segundos. Copiar dados. Responder as mesmas perguntas. Montar o mesmo relatório toda segunda.',
    'Cada hora manual é receita perdida. E o custo invisível está corroendo sua margem.',
  ],
  [
    'Você contrata mais gente, mas o gargalo continua. O problema não é falta de equipe — é falta de automação.',
    'Enquanto isso, leads esfriam, relatórios atrasam, e decisões são tomadas no escuro.',
  ],
  [
    'Ferramentas genéricas prometem resolver. Mas cada nova ferramenta é mais uma tela aberta, mais uma senha, mais uma integração quebrada.',
    'Você precisa de algo que conecte tudo — e trabalhe sozinho.',
  ],
]

export function ManifestoProblems() {
  return (
    <div id="manifesto">
      {blocks.map((paragraphs, i) => (
        <section key={i} className="section section--center">
          {paragraphs.map((text, j) => (
            <Reveal key={j} delay={j * 0.3}>
              <p className="manifesto__text">{text}</p>
            </Reveal>
          ))}
        </section>
      ))}
    </div>
  )
}
