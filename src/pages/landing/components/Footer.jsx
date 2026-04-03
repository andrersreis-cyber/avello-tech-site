import { WPP_NUM } from '../lib/constants'

export function Footer() {
  return (
    <footer className="av-footer">
      <span>&copy; 2025 Avello Tech. Todos os direitos reservados.</span>
      <div className="av-footer-links">
        <a href="#">Privacidade</a>
        <a href="#">Termos</a>
        <a href={`https://wa.me/${WPP_NUM}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
    </footer>
  )
}
