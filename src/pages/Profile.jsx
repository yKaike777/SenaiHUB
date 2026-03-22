import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaGraduationCap, FaEdit, FaCheck, FaTimes, FaCamera } from 'react-icons/fa'
import defaultAvatar from '../assets/default-avatar.jpg'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile, uploadProfilePicture, getUsersByIds, followUser, unfollowUser } from '../firebase'

function Profile() {
  const { currentUser, setCurrentUser } = useAuth()
  const navigate                         = useNavigate()
  const [editing, setEditing]            = useState(false)
  const [saving, setSaving]              = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError]                = useState('')
  const [photoError, setPhotoError]      = useState('')
  const [activeTab, setActiveTab]        = useState('followers')
  const [followerUsers, setFollowerUsers]  = useState([])
  const [followingUsers, setFollowingUsers] = useState([])
  const [loadingList, setLoadingList]    = useState(false)
  const [pendingFollow, setPendingFollow] = useState({})
  const fileInputRef                     = useRef(null)

  const [form, setForm] = useState({ name: '', bio: '', location: '', course: '' })

  // Carrega lista ao trocar aba
  useEffect(() => {
    if (!currentUser) return
    setLoadingList(true)
    const ids = activeTab === 'followers'
      ? (currentUser.followers || [])
      : (currentUser.following || [])

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
  }, [activeTab, currentUser?.followers?.length, currentUser?.following?.length])

  function startEdit() {
    setForm({
      name:     currentUser?.name     || '',
      bio:      currentUser?.bio      || '',
      location: currentUser?.location || '',
      course:   currentUser?.course   || '',
    })
    setEditing(true)
    setError('')
  }

  function cancelEdit() { setEditing(false); setError('') }

  async function saveEdit() {
    if (!form.name.trim()) return setError('O nome não pode ficar vazio.')
    setSaving(true)
    setError('')
    try {
      await updateUserProfile(currentUser.id, form)
      setCurrentUser(prev => ({ ...prev, ...form }))
      setEditing(false)
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      return setPhotoError('Use JPG, PNG ou WebP.')
    if (file.size > 3 * 1024 * 1024)
      return setPhotoError('Máximo 3 MB.')

    setUploadingPhoto(true)
    setPhotoError('')
    try {
      const url = await uploadProfilePicture(currentUser.id, file)
      await updateUserProfile(currentUser.id, { profilePicture: url })
      setCurrentUser(prev => ({ ...prev, profilePicture: url }))
    } catch (err) {
      setPhotoError('Erro ao enviar foto.')
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  async function handleFollowToggle(user) {
    if (!currentUser || pendingFollow[user.id]) return
    setPendingFollow(p => ({ ...p, [user.id]: true }))
    const already = currentUser.following?.includes(user.id)
    try {
      if (already) {
        await unfollowUser(currentUser.id, user.id)
        setCurrentUser(prev => ({
          ...prev,
          following: (prev.following || []).filter(id => id !== user.id),
        }))
        setFollowingUsers(prev => prev.filter(u => u.id !== user.id))
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
      setPendingFollow(p => ({ ...p, [user.id]: false }))
    }
  }

  if (!currentUser) return (
    <div className="profile-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-3)' }}>Carregando perfil...</p>
    </div>
  )

  const listToShow = activeTab === 'followers' ? followerUsers : followingUsers

  return (
    <div className="profile-layout">

      {/* Cabeçalho */}
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <img
            src={currentUser.profilePicture || defaultAvatar}
            alt="avatar"
            className="profile-avatar"
          />
          <button
            className="profile-avatar-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            title="Trocar foto"
          >
            {uploadingPhoto ? '...' : <FaCamera />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          {photoError && <p className="profile-photo-error">{photoError}</p>}
        </div>

        <div className="profile-info">
          {editing
            ? <input className="profile-edit-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Seu nome" />
            : <h2 className="profile-name">{currentUser.name}</h2>}

          {editing
            ? <textarea className="profile-edit-textarea" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Sua bio..." rows={2} />
            : <p className="profile-bio">{currentUser.bio || 'Nenhuma bio ainda.'}</p>}

          <div className="profile-meta">
            <span className="profile-meta-item">
              <FaMapMarkerAlt />
              {editing
                ? <input className="profile-edit-input-sm" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Localização" />
                : currentUser.location || 'Não informado'}
            </span>
            <span className="profile-meta-item">
              <FaGraduationCap />
              {editing
                ? <input className="profile-edit-input-sm" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="Curso" />
                : currentUser.course || 'Não informado'}
            </span>
          </div>

          {error && <p className="profile-error">{error}</p>}

          <div className="profile-actions">
            {editing ? (
              <>
                <button className="profile-btn-save" onClick={saveEdit} disabled={saving}>
                  <FaCheck /> {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button className="profile-btn-cancel" onClick={cancelEdit} disabled={saving}>
                  <FaTimes /> Cancelar
                </button>
              </>
            ) : (
              <button className="profile-btn-edit" onClick={startEdit}>
                <FaEdit /> Editar perfil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas clicáveis */}
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-number">{currentUser.postCount || 0}</span>
          <span className="profile-stat-label">Posts</span>
        </div>
        <div
          className={`profile-stat profile-stat-clickable ${activeTab === 'followers' ? 'profile-stat-active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          <span className="profile-stat-number">{currentUser.followers?.length || 0}</span>
          <span className="profile-stat-label">Seguidores</span>
        </div>
        <div
          className={`profile-stat profile-stat-clickable ${activeTab === 'following' ? 'profile-stat-active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          <span className="profile-stat-number">{currentUser.following?.length || 0}</span>
          <span className="profile-stat-label">Seguindo</span>
        </div>
      </div>

      {/* Abas seguidores / seguindo */}
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

        {loadingList ? (
          <p className="follow-list-empty">Carregando...</p>
        ) : listToShow.length === 0 ? (
          <p className="follow-list-empty">
            {activeTab === 'followers' ? 'Nenhum seguidor ainda.' : 'Você não segue ninguém ainda.'}
          </p>
        ) : (
          <ul className="follow-list">
            {listToShow.map(user => {
              const isFollowing = currentUser.following?.includes(user.id)
              return (
                <li key={user.id} className="follow-item">
                  <img
                    src={user.profilePicture || defaultAvatar}
                    alt="avatar"
                    className="follow-avatar"
                    onClick={() => navigate(`/user/${user.id}`)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="follow-info" onClick={() => navigate(`/user/${user.id}`)} style={{ cursor: 'pointer' }}>
                    <span className="follow-name">{user.name}</span>
                    <span className="follow-course">{user.course}</span>
                  </div>

                  <button className={`suggested-btn ${isFollowing ? 'suggested-btn-following' : ''}`} onClick={() => handleFollowToggle(user)} disabled={!!pendingFollow[user.id]}>
                    {pendingFollow[user.id] ? '...' : isFollowing ? 'Seguindo' : 'Seguir'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

    </div>
  )
}

export default Profile