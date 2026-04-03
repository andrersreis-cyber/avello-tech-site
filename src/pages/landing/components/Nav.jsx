import { WPP_NUM, SECTIONS } from '../lib/constants'

export function Nav() {
  return (
    <nav className="av-nav">
      <a href="#" className="av-logo">Avello</a>
      <ul className="av-nav-links">
        {SECTIONS.map(s => (
          <li key={s.id} className="nav-hide">
            <a href={`#${s.id}`}>{s.label}</a>
          </li>
        ))}
        <li>
          <a
            className="av-btn"
            href={`https://wa.me/${WPP_NUM}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Falar no WhatsApp
          </a>
        </li>
      </ul>
    </nav>
  )
}
