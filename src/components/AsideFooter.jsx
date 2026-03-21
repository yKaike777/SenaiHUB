import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { logout } from '../firebase'
import defaultAvatar from '../assets/default-avatar.jpg'

function AsideFooter() {
  const { currentUser }       = useAuth()
  const navigate              = useNavigate()
  const [open, setOpen]       = useState(false)
  const popupRef              = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/login')
  }

  function goTo(path) {
    setOpen(false)
    navigate(path)
  }

  return (
    <div className="aside-footer" ref={popupRef}>

      {open && (
        <div className="user-popup">
          <div className="user-popup-header">
            <img
              src={currentUser?.profilePicture || defaultAvatar}
              alt="avatar"
              className="popup-avatar"
            />
            <div className="popup-user-info">
              <span className="popup-name">{currentUser?.name || 'Usuário'}</span>
              <span className="popup-email">{currentUser?.email || ''}</span>
            </div>
          </div>

          <hr className="popup-divider" />

          <button className="popup-item" onClick={() => goTo('/profile')}>
            <FaUser /> Meu perfil
          </button>
          <button className="popup-item" onClick={() => goTo('/configuration')}>
            <FaCog /> Configurações
          </button>

          <hr className="popup-divider" />

          <button className="popup-item popup-item-danger" onClick={handleLogout}>
            <FaSignOutAlt /> Sair
          </button>
        </div>
      )}

      <span className="aside-footer-inner" onClick={() => setOpen(o => !o)}>
        <img
          src={currentUser?.profilePicture || defaultAvatar}
          alt="avatar"
          className="user-avatar"
        />
        <p className="aside-footer-name">
          {currentUser?.name || 'Usuário'}
        </p>
        <span className={`aside-footer-chevron ${open ? 'chevron-up' : ''}`}>V</span>
      </span>

    </div>
  )
}

export default AsideFooter