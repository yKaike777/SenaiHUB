import { useNavigate } from 'react-router-dom'
import defaultAvatar from '../assets/default-avatar.jpg'
import { useAuth } from '../context/AuthContext'

function UserInfo({ user, date, userId }) {
  const { currentUser } = useAuth()
  const navigate        = useNavigate()

  const displayUser = user || currentUser
  const targetId    = userId || displayUser?.id

  function formatDate(timestamp) {
    if (!timestamp) return ''
    const d    = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const diff = Math.floor((Date.now() - d) / 60000)
    if (diff < 1)    return 'agora'
    if (diff < 60)   return `${diff}min atrás`
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`
    return `${Math.floor(diff / 1440)}d atrás`
  }

  function handleClick() {
    if (!targetId) return
    if (targetId === currentUser?.id) navigate('/profile')
    else navigate(`/user/${targetId}`)
  }

  return (
    <div className="user-info">
      <img
        src={displayUser?.profilePicture || defaultAvatar}
        alt="avatar"
        className={`user-avatar ${targetId ? 'user-avatar-clickable' : ''}`}
        onClick={targetId ? handleClick : undefined}
      />
      <span
        className={`user-name ${targetId ? 'user-name-clickable' : ''}`}
        onClick={targetId ? handleClick : undefined}
      >
        {displayUser?.name || 'Carregando...'}
        <span className="user-course">
          {displayUser?.course || ''}
          {date && (
            <> ● <span className="post-date">{formatDate(date)}</span></>
          )}
        </span>
      </span>
    </div>
  )
}

export default UserInfo