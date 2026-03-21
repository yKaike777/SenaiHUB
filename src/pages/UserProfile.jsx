import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaGraduationCap, FaArrowLeft, FaUserCheck, FaUserPlus } from 'react-icons/fa'
import defaultAvatar from '../assets/default-avatar.jpg'
import { useAuth } from '../context/AuthContext'
import { getUser, followUser, unfollowUser, getUsersByIds } from '../firebase'

function FollowList({ users, loading, emptyMsg, currentUser, setCurrentUser, navigate }) {
  const [pending, setPending] = useState({})

  async function handleFollow(user) {
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

  if (loading) return <p className="follow-list-empty">Carregando...</p>
  if (!users.length) return <p className="follow-list-empty">{emptyMsg}</p>

  return (
    <ul className="follow-list">
      {users.map(user => {
        const isMe        = currentUser?.id === user.id
        const isFollowing = currentUser?.following?.includes(user.id)
        return (
          <li key={user.id} className="follow-item">
            <img
              src={user.profilePicture || defaultAvatar}
              alt="avatar"
              className="follow-avatar"
              onClick={() => navigate(`/user/${user.id}`)}
              style={{ cursor: 'pointer' }}
            />
            <div
              className="follow-info"
              onClick={() => navigate(`/user/${user.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <span className="follow-name">{user.name}</span>
              <span className="follow-course">{user.course}</span>
            </div>
            {!isMe && (
              <button
                className={`suggested-btn ${isFollowing ? 'suggested-btn-following' : ''}`}
                onClick={() => handleFollow(user)}
                disabled={!!pending[user.id]}
              >
                {pending[user.id] ? '...' : isFollowing ? 'Seguindo' : 'Seguir'}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function UserProfile() {
  const { uid }                           = useParams()
  const { currentUser, setCurrentUser }   = useAuth()
  const navigate                          = useNavigate()
  const [profileUser, setProfileUser]     = useState(null)
  const [loading, setLoading]             = useState(true)
  const [followPending, setFollowPending] = useState(false)
  const [activeTab, setActiveTab]         = useState('followers')
  const [followerUsers, setFollowerUsers] = useState([])
  const [followingUsers, setFollowingUsers] = useState([])
  const [loadingList, setLoadingList]     = useState(false)

  const isOwnProfile = currentUser?.id === uid
  const isFollowing  = currentUser?.following?.includes(uid)

  useEffect(() => {
    if (!uid) return
    if (isOwnProfile) { navigate('/profile', { replace: true }); return }
    setLoading(true)
    getUser(uid)
      .then(u => setProfileUser(u))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [uid])

  useEffect(() => {
    if (!profileUser) return
    setLoadingList(true)
    const ids = activeTab === 'followers'
      ? (profileUser.followers || [])
      : (profileUser.following || [])

    if (!ids.length) {
      activeTab === 'followers' ? setFollowerUsers([]) : setFollowingUsers([])
      setLoadingList(false)
      return
    }

    getUsersByIds(ids)
      .then(users => {
        activeTab === 'followers' ? setFollowerUsers(users) : setFollowingUsers(users)
      })
      .catch(console.error)
      .finally(() => setLoadingList(false))
  }, [activeTab, profileUser])

  async function handleFollow() {
    if (!currentUser || followPending) return
    setFollowPending(true)
    try {
      if (isFollowing) {
        await unfollowUser(currentUser.id, uid)
        setCurrentUser(prev => ({
          ...prev,
          following: (prev.following || []).filter(id => id !== uid),
        }))
        setProfileUser(prev => ({
          ...prev,
          followers: (prev.followers || []).filter(id => id !== currentUser.id),
        }))
      } else {
        await followUser(currentUser.id, uid)
        setCurrentUser(prev => ({
          ...prev,
          following: [...(prev.following || []), uid],
        }))
        setProfileUser(prev => ({
          ...prev,
          followers: [...(prev.followers || []), currentUser.id],
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFollowPending(false)
    }
  }

  if (loading) return (
    <div className="profile-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-3)' }}>Carregando perfil...</p>
    </div>
  )

  if (!profileUser) return (
    <div className="profile-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-3)' }}>Usuário não encontrado.</p>
    </div>
  )

  const listToShow = activeTab === 'followers' ? followerUsers : followingUsers

  return (
    <div className="profile-layout">

      <button className="profile-back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Voltar
      </button>

      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <img
            src={profileUser.profilePicture || defaultAvatar}
            alt="avatar"
            className="profile-avatar"
          />
        </div>

        <div className="profile-info">
          <h2 className="profile-name">{profileUser.name}</h2>
          <p className="profile-bio">{profileUser.bio || 'Nenhuma bio ainda.'}</p>

          <div className="profile-meta">
            <span className="profile-meta-item">
              <FaMapMarkerAlt />
              {profileUser.location || 'Não informado'}
            </span>
            <span className="profile-meta-item">
              <FaGraduationCap />
              {profileUser.course || 'Não informado'}
            </span>
          </div>

          <div className="profile-actions">
            <button
              className={`profile-btn-follow ${isFollowing ? 'profile-btn-unfollow' : ''}`}
              onClick={handleFollow}
              disabled={followPending}
            >
              {isFollowing
                ? <><FaUserCheck /> Seguindo</>
                : <><FaUserPlus /> Seguir</>
              }
            </button>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-number">{profileUser.postCount || 0}</span>
          <span className="profile-stat-label">Posts</span>
        </div>
        <div
          className={`profile-stat profile-stat-clickable ${activeTab === 'followers' ? 'profile-stat-active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          <span className="profile-stat-number">{profileUser.followers?.length || 0}</span>
          <span className="profile-stat-label">Seguidores</span>
        </div>
        <div
          className={`profile-stat profile-stat-clickable ${activeTab === 'following' ? 'profile-stat-active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          <span className="profile-stat-number">{profileUser.following?.length || 0}</span>
          <span className="profile-stat-label">Seguindo</span>
        </div>
      </div>

      <div className="profile-follow-list-card">
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'followers' ? 'profile-tab-active' : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            Seguidores
          </button>
          <button
            className={`profile-tab ${activeTab === 'following' ? 'profile-tab-active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            Seguindo
          </button>
        </div>

        <FollowList
          users={listToShow}
          loading={loadingList}
          emptyMsg={activeTab === 'followers' ? 'Nenhum seguidor ainda.' : 'Não segue ninguém ainda.'}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          navigate={navigate}
        />
      </div>

    </div>
  )
}

export default UserProfile