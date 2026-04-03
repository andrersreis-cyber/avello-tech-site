import { useEffect, useRef, useState, useCallback } from 'react'

const WPP_NUM = '5527992594613'

/* ── Scroll-triggered reveal hook ── */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) { el.classList.add('is-visible'); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('is-visible'); io.unobserve(el) }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useReveal()
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </Tag>
  )
}

function RevealText({ children, className = '', delay = 0, as: Tag = 'span' }) {
  const ref = useReveal()
  return (
    <Tag ref={ref} className={`reveal-text ${className}`} style={{ transitionDelay: `${delay}s` }}>
      <span className="reveal-text__inner">{children}</span>
    </Tag>
  )
}

export function LandingPage() {
  const [form, setForm] = useState({ nome: '', empresa: '', whatsapp: '', desafio: '', detalhes: '' })
  const [done, setDone] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  /* loader */
  useEffect(() => {
    let p = 0
    const id = setInterval(() => {
      p += Math.random() * 18 + 2
      if (p >= 100) { p = 100; clearInterval(id); setTimeout(() => setLoaded(true), 400) }
      setProgress(Math.round(p))
    }, 120)
    return () => clearInterval(id)
  }, [])

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }
  function handleSubmit(e) {
    e.preventDefault()
    const msg = encodeURIComponent(
      `*Novo lead pelo site Avello*\n\n*Nome:* ${form.nome}\n*Empresa:* ${form.empresa}\n*WhatsApp:* ${form.whatsapp}\n*Desafio:* ${form.desafio}${form.detalhes ? `\n*Detalhes:* ${form.detalhes}` : ''}`
    )
    window.open(`https://wa.me/${WPP_NUM}?text=${msg}`, '_blank')
    setDone(true)
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition-duration:0s!important;animation-duration:0s!important}}

    .av{
      --bg:#000;--text:#fff;--muted:rgba(255,255,255,.45);--accent:#7c3aed;--accent2:#06b6d4;
      --font:'Space Grotesk',sans-serif;--body:'DM Sans',sans-serif;
      background:var(--bg);color:var(--text);font-family:var(--body);
      min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased
    }

    /* ── loader ── */
    .loader{position:fixed;inset:0;z-index:9999;background:#000;display:flex;flex-direction:column;justify-content:center;align-items:center;transition:opacity .6s ease,visibility .6s ease}
    .loader.is-done{opacity:0;visibility:hidden;pointer-events:none}
    .loader__text{font-family:var(--font);font-size:clamp(20px,3vw,32px);font-weight:300;text-align:center;line-height:1.4;letter-spacing:-.02em;margin-bottom:48px;padding:0 24px}
    .loader__progress{font-family:var(--font);font-size:clamp(48px,10vw,120px);font-weight:300;letter-spacing:-.04em;line-height:1;color:var(--text)}
    .loader__label{font-family:var(--body);font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:16px}

    /* ── nav ── */
    .av-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:24px 48px;mix-blend-mode:difference}
    .av-logo{font-family:var(--font);font-size:22px;font-weight:500;color:#fff;text-decoration:none;letter-spacing:-.02em}
    .av-nav-links{display:flex;gap:32px;list-style:none;align-items:center}
    .av-nav-links a{color:rgba(255,255,255,.6);text-decoration:none;font-size:14px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;transition:color .3s}
    .av-nav-links a:hover{color:#fff}
    .av-btn{
      display:inline-block;font-family:var(--body);font-size:14px;font-weight:600;
      letter-spacing:.025em;text-transform:uppercase;color:#fff;text-decoration:none;
      border:1px solid rgba(255,255,255,.3);border-radius:0;padding:12px 24px;
      transition:background .3s,border-color .3s;cursor:pointer;background:transparent
    }
    .av-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.6)}

    /* ── sections ── */
    .section{min-height:100vh;display:flex;flex-direction:column;justify-content:flex-end;padding:0 48px 80px;position:relative}
    .section--center{justify-content:center}
    .section--tall{min-height:120vh}

    /* ── hero ── */
    .hero__title{font-family:var(--font);font-size:clamp(48px,10vw,150px);font-weight:300;line-height:.92;letter-spacing:-.03em;margin-bottom:40px}
    .hero__sub{font-family:var(--body);font-size:16px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--accent);margin-bottom:24px;line-height:1.3}
    .hero__body{font-family:var(--body);font-size:clamp(16px,2vw,24px);font-weight:300;line-height:1.55;letter-spacing:-.02em;max-width:580px;margin-bottom:40px;color:rgba(255,255,255,.75)}
    .hero__cta{overflow:hidden}

    /* ── intro ── */
    .intro__title{font-family:var(--font);font-size:clamp(28px,5vw,56px);font-weight:300;line-height:1.15;letter-spacing:-.03em;margin-bottom:32px}
    .intro__body{font-family:var(--body);font-size:clamp(16px,2vw,24px);font-weight:300;line-height:1.55;letter-spacing:-.02em;max-width:640px;color:rgba(255,255,255,.75)}

    /* ── manifesto ── */
    .manifesto__text{font-family:var(--font);font-size:clamp(22px,4vw,48px);font-weight:300;line-height:1.25;letter-spacing:-.03em}
    .manifesto__text + .manifesto__text{margin-top:1.5em}

    /* ── manifesto section ── */
    .manifesto-sec{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:0 48px}
    .manifesto-sec--right{align-items:flex-end}
    .manifesto-sec__inner{max-width:680px}
    .manifesto-sec__title{font-family:var(--font);font-size:clamp(28px,5vw,56px);font-weight:300;line-height:1.15;letter-spacing:-.03em;margin-bottom:32px}
    .manifesto-sec__body p{font-family:var(--body);font-size:clamp(16px,2vw,24px);font-weight:300;line-height:1.55;letter-spacing:-.02em;color:rgba(255,255,255,.75);margin-bottom:1.2em}

    /* ── proof ── */
    .proof{min-height:80vh;display:flex;flex-direction:column;justify-content:center;padding:0 48px}
    .proof__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:48px;margin-top:64px}
    .proof__num{font-family:var(--font);font-size:clamp(40px,6vw,80px);font-weight:300;line-height:1;letter-spacing:-.03em;display:block}
    .proof__num em{font-style:normal;color:var(--accent);font-size:.5em;vertical-align:super}
    .proof__label{font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:12px;display:block}

    /* ── cta ── */
    .cta{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:80px 48px;text-align:center}
    .cta__title{font-family:var(--font);font-size:clamp(28px,5vw,64px);font-weight:300;line-height:1.12;letter-spacing:-.03em;max-width:800px;margin-bottom:48px}

    /* ── form ── */
    .av-form{width:100%;max-width:560px;text-align:left}
    .av-form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .av-field{margin-bottom:16px}
    .av-label{display:block;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
    .av-input{width:100%;background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.2);padding:12px 0;color:#fff;font-family:var(--body);font-size:16px;transition:border-color .3s;outline:none;border-radius:0}
    .av-input:focus{border-color:var(--accent)}
    .av-input::placeholder{color:rgba(255,255,255,.2)}
    textarea.av-input{resize:vertical;min-height:64px;border:1px solid rgba(255,255,255,.15);padding:12px;margin-top:4px}
    .av-submit{
      margin-top:24px;width:100%;font-family:var(--body);font-size:14px;font-weight:600;
      letter-spacing:.025em;text-transform:uppercase;color:#fff;
      border:1px solid rgba(255,255,255,.3);padding:16px;background:transparent;
      cursor:pointer;transition:background .3s,border-color .3s
    }
    .av-submit:hover{background:var(--accent);border-color:var(--accent)}
    .av-wpp-link{display:block;text-align:center;margin-top:20px;color:var(--muted);font-size:14px;text-decoration:none;transition:color .3s}
    .av-wpp-link:hover{color:#fff}

    .av-success{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;text-align:center}
    .av-success-title{font-family:var(--font);font-size:24px;font-weight:300;margin-bottom:12px}
    .av-success-desc{font-size:16px;color:var(--muted)}

    /* ── footer ── */
    .av-footer{padding:48px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:var(--muted)}
    .av-footer a{color:var(--muted);text-decoration:none;transition:color .3s}
    .av-footer a:hover{color:#fff}
    .av-footer-links{display:flex;gap:24px}

    /* ── reveal animations ── */
    .reveal{opacity:0;transform:translateY(40px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
    .reveal.is-visible{opacity:1;transform:translateY(0)}
    .reveal-text{display:block;overflow:hidden}
    .reveal-text__inner{display:block;transform:translateY(105%) rotate(3deg);transform-origin:left bottom;transition:transform 1s cubic-bezier(.16,1,.3,1)}
    .reveal-text.is-visible .reveal-text__inner{transform:translateY(0) rotate(0)}

    /* ── responsive ── */
    @media(max-width:768px){
      .av-nav{padding:16px 20px}
      .av-nav-links{gap:16px}
      .av-nav-links .nav-hide{display:none}
      .section{padding:0 20px 60px}
      .manifesto-sec{padding:0 20px}
      .proof{padding:0 20px}
      .proof__grid{grid-template-columns:repeat(2,1fr);gap:32px}
      .cta{padding:60px 20px}
      .av-form-row{grid-template-columns:1fr}
      .av-footer{padding:32px 20px;flex-direction:column;gap:16px;text-align:center}
    }
  `

  return (
    <div className="av">
      <style>{css}</style>

      {/* loader */}
      <div className={`loader ${loaded ? 'is-done' : ''}`}>
        <div className="loader__text">
          Sua empresa tem a resposta.<br/>A Avello vai encontrá-la.
        </div>
        <div className="loader__progress">{progress}</div>
        <div className="loader__label">{progress < 100 ? 'Carregando...' : 'Pronto'}</div>
      </div>

      {/* nav */}
      <nav className="av-nav">
        <a href="#" className="av-logo">Avello</a>
        <ul className="av-nav-links">
          <li className="nav-hide"><a href="#manifesto">Manifesto</a></li>
          <li className="nav-hide"><a href="#resultados">Resultados</a></li>
          <li><a href="#contato">Contato</a></li>
          <li>
            <a className="av-btn" href={`https://wa.me/${WPP_NUM}`} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
          </li>
        </ul>
      </nav>

      {/* hero */}
      <section className="section">
        <RevealText className="hero__title" as="h1" delay={0.2}>Sua operação</RevealText>
        <RevealText className="hero__title" delay={0.4}>no piloto</RevealText>
        <RevealText className="hero__title" delay={0.6}>automático.</RevealText>
        <Reveal delay={1}>
          <div className="hero__sub">Automação com IA que trabalha enquanto você dorme.</div>
        </Reveal>
        <Reveal delay={1.2}>
          <p className="hero__body">
            Conecte-se ao poder da inteligência artificial. A Avello cria agentes autônomos, integrações e dashboards que eliminam trabalho manual e aceleram suas decisões.
          </p>
        </Reveal>
        <Reveal className="hero__cta" delay={1.4}>
          <button className="av-btn" onClick={() => document.getElementById('contato').scrollIntoView({ behavior: 'smooth' })}>
            Quero um diagnóstico gratuito
          </button>
        </Reveal>
      </section>

      {/* introduction */}
      <section className="section section--tall section--center">
        <Reveal>
          <h2 className="intro__title">Tome decisões com confiança</h2>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="intro__body">
            Nossa tecnologia de IA automatiza a extração de conhecimento de toda a sua operação para que você elimine a adivinhação do seu trabalho.
          </p>
        </Reveal>
      </section>

      {/* manifesto — problem */}
      <section id="manifesto" className="section section--center">
        <Reveal><p className="manifesto__text">Esta é a sua empresa hoje. Incontáveis fragmentos de informação crítica espalhados por centenas de sistemas diferentes.</p></Reveal>
        <Reveal delay={0.3}><p className="manifesto__text">30% do tempo da sua equipe é gasto tentando organizar e encontrar as informações que precisam para fazer o trabalho.</p></Reveal>
      </section>

      <section className="section section--center">
        <Reveal><p className="manifesto__text">A batalha impossível de dar sentido a esse caos deixa sua equipe sobrecarregada e improdutiva.</p></Reveal>
        <Reveal delay={0.3}><p className="manifesto__text">Eles enfrentam a ansiedade de incomodar um colega ocupado de novo, ou tentar conectar pontos com contexto incompleto.</p></Reveal>
      </section>

      <section className="section section--center">
        <Reveal><p className="manifesto__text">Soluções existentes são pesadas e rapidamente ficam desatualizadas. Mais um sistema decadente que exige manutenção contínua.</p></Reveal>
        <Reveal delay={0.3}><p className="manifesto__text">Elas falham em entender o que você precisa da imensa quantidade de informação que sua equipe cria todos os dias.</p></Reveal>
      </section>

      {/* manifesto — solution */}
      <section className="manifesto-sec">
        <div className="manifesto-sec__inner">
          <Reveal><h2 className="manifesto-sec__title">Chega de apagar incêndio.</h2></Reveal>
          <div className="manifesto-sec__body">
            <Reveal delay={0.2}><p>A Avello é sua fonte inteligente de verdade em tempo real que elimina as lutas culturais, financeiras e operacionais de ferramentas fragmentadas.</p></Reveal>
            <Reveal delay={0.4}><p>Conectamos seus sistemas nos bastidores e reunimos exatamente o conhecimento que você precisa em agentes autônomos que trabalham 24 horas.</p></Reveal>
            <Reveal delay={0.6}><p>Simplesmente peça à Avello a resposta que avança seu trabalho e te ajuda a tomar decisões melhores com mais confiança.</p></Reveal>
          </div>
        </div>
      </section>

      {/* manifesto — mission */}
      <section className="manifesto-sec manifesto-sec--right">
        <div className="manifesto-sec__inner">
          <Reveal><h2 className="manifesto-sec__title">Construa um negócio que escala.</h2></Reveal>
          <div className="manifesto-sec__body">
            <Reveal delay={0.2}><p>Nossa missão é tornar o trabalho mais coerente e eficiente — redefinindo produtividade de <em>fazer mais</em> para <em>ser melhor</em>.</p></Reveal>
            <Reveal delay={0.4}><p>Seus momentos mais felizes e produtivos no trabalho são quando você está em flow, intelectualmente estimulado, e criando valor real para seus clientes.</p></Reveal>
            <Reveal delay={0.6}><p>Queremos recriar isso toda vez que você usa a Avello. Uma ferramenta completamente integrada com a forma como você pensa, sente e trabalha.</p></Reveal>
          </div>
        </div>
      </section>

      {/* proof */}
      <section id="resultados" className="proof">
        <Reveal><h2 className="intro__title">Números que falam.</h2></Reveal>
        <div className="proof__grid">
          <Reveal delay={0.1}><div><span className="proof__num">+50k</span><span className="proof__label">Leads gerados</span></div></Reveal>
          <Reveal delay={0.2}><div><span className="proof__num">1.200<em>h</em></span><span className="proof__label">Economizadas / mês</span></div></Reveal>
          <Reveal delay={0.3}><div><span className="proof__num">+45<em>%</em></span><span className="proof__label">Taxa de conversão</span></div></Reveal>
          <Reveal delay={0.4}><div><span className="proof__num">99.9<em>%</em></span><span className="proof__label">Uptime garantido</span></div></Reveal>
        </div>
      </section>

      {/* cta + form */}
      <section id="contato" className="cta">
        <Reveal>
          <h2 className="cta__title">Sua empresa tem a resposta. Peça à Avello para encontrá-la.</h2>
        </Reveal>
        <Reveal delay={0.3}>
          {done ? (
            <div className="av-success">
              <p className="av-success-title">Mensagem enviada com sucesso.</p>
              <p className="av-success-desc">Entraremos em contato em até 24h.</p>
            </div>
          ) : (
            <form className="av-form" onSubmit={handleSubmit}>
              <div className="av-form-row">
                <div className="av-field">
                  <label className="av-label" htmlFor="nome">Nome</label>
                  <input className="av-input" id="nome" name="nome" required placeholder="Seu nome" value={form.nome} onChange={handleChange} />
                </div>
                <div className="av-field">
                  <label className="av-label" htmlFor="empresa">Empresa</label>
                  <input className="av-input" id="empresa" name="empresa" required placeholder="Nome da empresa" value={form.empresa} onChange={handleChange} />
                </div>
              </div>
              <div className="av-form-row">
                <div className="av-field">
                  <label className="av-label" htmlFor="whatsapp">WhatsApp</label>
                  <input className="av-input" id="whatsapp" name="whatsapp" required placeholder="(27) 99999-9999" value={form.whatsapp} onChange={handleChange} />
                </div>
                <div className="av-field">
                  <label className="av-label" htmlFor="desafio">Maior desafio</label>
                  <input className="av-input" id="desafio" name="desafio" required placeholder="Ex: atendimento, relatórios..." value={form.desafio} onChange={handleChange} />
                </div>
              </div>
              <div className="av-field">
                <label className="av-label" htmlFor="detalhes">Detalhes (opcional)</label>
                <textarea className="av-input" id="detalhes" name="detalhes" placeholder="Descreva brevemente..." value={form.detalhes} onChange={handleChange} />
              </div>
              <button type="submit" className="av-submit">Agendar Diagnóstico Gratuito</button>
              <a className="av-wpp-link" href={`https://wa.me/${WPP_NUM}`} target="_blank" rel="noopener noreferrer">
                Ou fale direto no WhatsApp &rarr;
              </a>
            </form>
          )}
        </Reveal>
      </section>

      {/* footer */}
      <footer className="av-footer">
        <span>&copy; 2025 Avello Tech. Todos os direitos reservados.</span>
        <div className="av-footer-links">
          <a href="#">Privacidade</a>
          <a href="#">Termos</a>
          <a href={`https://wa.me/${WPP_NUM}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </footer>
    </div>
  )
}
