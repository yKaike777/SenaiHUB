import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaTimes, FaBars, FaHome, FaCog, FaBook, FaEnvelope, FaUser } from 'react-icons/fa'
import AsideFooter from './AsideFooter'
import { useNotifications } from '../context/NotificationContext'

function Aside() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalUnread }             = useNotifications()

  function closeMenu() { setMobileOpen(false) }

  return (
    <>
      <button className="aside-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {mobileOpen && <div className="aside-overlay" onClick={closeMenu} />}

      <div className={`Aside ${mobileOpen ? 'aside-mobile-open' : ''}`}>
        <h1>SENAIHub</h1>

        <NavLink
          to="/"
          end
          className={({ isActive }) => isActive ? 'link ativo' : 'link'}
          onClick={closeMenu}
        >
          <span className="link-icon"><FaHome /></span>
          <span className="link-label">Feed</span>
        </NavLink>

        <NavLink
          to="/courses"
          className={({ isActive }) => isActive ? 'link ativo' : 'link'}
          onClick={closeMenu}
        >
          <span className="link-icon"><FaBook /></span>
          <span className="link-label">Cursos</span>
        </NavLink>

        {/* Link de mensagens com badge */}
        <NavLink
          to="/messages"
          className={({ isActive }) => isActive ? 'link ativo' : 'link'}
          onClick={closeMenu}
        >
          <span className="link-icon"><FaEnvelope /></span>
          <span className="link-label">Mensagens</span>
          {totalUnread > 0 && (
            <span className="aside-badge">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => isActive ? 'link ativo' : 'link'}
          onClick={closeMenu}
        >
          <span className="link-icon"><FaUser /></span>
          <span className="link-label">Perfil</span>
        </NavLink>

        <NavLink
          to="/configuration"
          className={({ isActive }) => isActive ? 'link ativo' : 'link'}
          onClick={closeMenu}
        >
          <span className="link-icon"><FaCog /></span>
          <span className="link-label">Configurações</span>
        </NavLink>

        <AsideFooter />
      </div>
    </>
  )
}

export default Aside