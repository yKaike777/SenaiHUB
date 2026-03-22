import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import defaultAvatar from '../assets/default-avatar.jpg'
import { useAuth } from '../context/AuthContext'
import { getSuggestedUsers, followUser, unfollowUser } from '../firebase'

function SuggestedUsers() {
  const { currentUser, setCurrentUser } = useAuth()
  const navigate                         = useNavigate()
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [pending, setPending]           = useState({})

  useEffect(() => {
    if (!currentUser) return
    getSuggestedUsers(currentUser.id, currentUser.following || [])
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [currentUser])

  async function handleFollow(e, user) {
    e.stopPropagation()
    if (!currentUser || pending[user.id]) return
    setPending(p => ({ ...p, [user.id]: true }))
    const already = currentUser.following?.includes(user.id)
    try {
      if (already) {
        await unfollowUser(currentUser.id, user.id)
        setCurrentUser(prev => ({
          ...prev,
          following: (prev.following || []).filter(id => id !== user.id),
        }))
      } else {
        await followUser(currentUser.id, user.id)
        setCurrentUser(prev => ({
          ...prev,
          following: [...(prev.following || []), user.id],
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPending(p => ({ ...p, [user.id]: false }))
    }
  }

  if (loading) return (
    <aside className="suggested-panel">
      <h2 className="suggested-title">Sugeridos para você</h2>
      <p style={{ color: 'var(--text-3)', fontSize: '9pt', padding: '8px 0' }}>Carregando...</p>
    </aside>
  )

  if (!users.length) return (
    <aside className="suggested-panel">
      <h2 className="suggested-title">Sugeridos para você</h2>
      <p style={{ color: 'var(--text-3)', fontSize: '9pt', padding: '8px 0' }}>Nenhum usuário por aqui ainda.</p>
    </aside>
  )

  return (
    <aside className="suggested-panel">
      <h2 className="suggested-title">Sugeridos para você</h2>
      <ul className="suggested-list">
        {users.map(user => {
          const isFollowing = currentUser?.following?.includes(user.id)
          return (
            <li
              key={user.id}
              className="suggested-item suggested-item-clickable"
              onClick={() => navigate(`/user/${user.id}`)}
            >
              <img
                src={user.profilePicture || defaultAvatar}
                alt="avatar"
                className="user-avatar"
              />
              <div className="suggested-info">
                <span className="suggested-name">{user.name}</span>
                <span className="suggested-course">{user.course}</span>
              </div>
              <button
                className={`suggested-btn ${isFollowing ? 'suggested-btn-following' : ''}`}
                onClick={e => handleFollow(e, user)}
                disabled={!!pending[user.id]}
              >
                {pending[user.id] ? '...' : isFollowing ? 'Seguindo' : 'Seguir'}
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

export default SuggestedUsers