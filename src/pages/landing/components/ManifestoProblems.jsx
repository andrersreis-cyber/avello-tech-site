import { Reveal } from './Reveal'

const blocks = [
  [
    'O problema não é falta de gente. É falta de inteligência no processo.',
    'Sua equipe gasta horas copiando dados, respondendo as mesmas perguntas e montando o mesmo relatório toda semana. Enquanto isso, ninguém analisa o que realmente importa — e as decisões continuam sendo tomadas no achismo.',
    'Cada hora manual é margem perdida. E o custo invisível está corroendo seu negócio.',
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
