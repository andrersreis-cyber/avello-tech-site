import { useState } from 'react'
import { Reveal } from './Reveal'
import { WPP_NUM } from '../lib/constants'

export function CtaSection() {
  const [form, setForm] = useState({ nome: '', empresa: '', whatsapp: '', desafio: '', detalhes: '' })
  const [done, setDone] = useState(false)

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  function handleSubmit(e) {
    e.preventDefault()
    const msg = encodeURIComponent(
      `*Novo lead pelo site Avello*\n\n*Nome:* ${form.nome}\n*Empresa:* ${form.empresa}\n*WhatsApp:* ${form.whatsapp}\n*Desafio:* ${form.desafio}${form.detalhes ? `\n*Detalhes:* ${form.detalhes}` : ''}`
    )
    window.open(`https://wa.me/${WPP_NUM}?text=${msg}`, '_blank')
    setDone(true)
  }

  return (
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
  )
}
