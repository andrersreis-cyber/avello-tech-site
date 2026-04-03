import { Reveal } from './Reveal'

const blocks = [
  [
    'Esta é a sua empresa hoje. Incontáveis fragmentos de informação crítica espalhados por centenas de sistemas diferentes.',
    '30% do tempo da sua equipe é gasto tentando organizar e encontrar as informações que precisam para fazer o trabalho.',
  ],
  [
    'A batalha impossível de dar sentido a esse caos deixa sua equipe sobrecarregada e improdutiva.',
    'Eles enfrentam a ansiedade de incomodar um colega ocupado de novo, ou tentar conectar pontos com contexto incompleto.',
  ],
  [
    'Soluções existentes são pesadas e rapidamente ficam desatualizadas. Mais um sistema decadente que exige manutenção contínua.',
    'Elas falham em entender o que você precisa da imensa quantidade de informação que sua equipe cria todos os dias.',
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
