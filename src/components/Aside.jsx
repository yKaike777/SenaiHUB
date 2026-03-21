import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaTimes, FaBars, FaHome, FaCog, FaBook, FaEnvelope, FaUser } from 'react-icons/fa'
import AsideFooter from './AsideFooter'

const NAV_LINKS = [
  { to: '/',              label: 'Feed',          icon: <FaHome /> },
  { to: '/courses',       label: 'Cursos',        icon: <FaBook /> },
  { to: '/messages',      label: 'Mensagens',     icon: <FaEnvelope /> },
  { to: '/profile',       label: 'Perfil',        icon: <FaUser /> },
  { to: '/configuration', label: 'Configurações', icon: <FaCog /> },
]

function Aside() {
  const [mobileOpen, setMobileOpen] = useState(false)

  function closeMenu() { setMobileOpen(false) }

  return (
    <>
      {/* Botão hamburguer — só aparece no mobile */}
      <button className="aside-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay escuro atrás do menu no mobile */}
      {mobileOpen && <div className="aside-overlay" onClick={closeMenu} />}

      <div className={`Aside ${mobileOpen ? 'aside-mobile-open' : ''}`}>
        <h1>SENAIHub</h1>

        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => isActive ? 'link ativo' : 'link'}
            onClick={closeMenu}
          >
            <span className="link-icon">{icon}</span>
            <span className="link-label">{label}</span>
          </NavLink>
        ))}

        <AsideFooter />
      </div>
    </>
  )
}

export default Aside