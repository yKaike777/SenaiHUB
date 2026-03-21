import defaultAvatar from '../assets/default-avatar.jpg'
import { useAuth } from '../context/AuthContext'

function UserInfo({ user, date }) {
  const { currentUser } = useAuth()

  // Usa o usuário passado por prop (ex: autor do post) ou o usuário logado
  const displayUser = user || currentUser

  function formatDate(timestamp) {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const diff  = Math.floor((Date.now() - date) / 60000)
    if (diff < 1)   return 'agora'
    if (diff < 60)  return `${diff}min atrás`
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`
    return `${Math.floor(diff / 1440)}d atrás`
  }

  return (
    <div className="user-info">
      <img
        src={displayUser?.profilePicture || defaultAvatar}
        alt="avatar"
        className="user-avatar"
      />
      <span className="user-name">
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