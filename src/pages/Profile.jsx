import { useState, useRef } from 'react'
import { FaMapMarkerAlt, FaGraduationCap, FaEdit, FaCheck, FaTimes, FaCamera } from 'react-icons/fa'
import defaultAvatar from '../assets/default-avatar.jpg'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile, uploadProfilePicture } from '../firebase'

function Profile() {
  const { currentUser, setCurrentUser } = useAuth()
  const [editing, setEditing]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError]               = useState('')
  const [photoError, setPhotoError]     = useState('')
  const fileInputRef                    = useRef(null)

  const [form, setForm] = useState({ name: '', bio: '', location: '', course: '' })

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
    if (!['image/jpeg','image/png','image/webp'].includes(file.type))
      return setPhotoError('Use uma imagem JPG, PNG ou WebP.')
    if (file.size > 3 * 1024 * 1024)
      return setPhotoError('A imagem deve ter no máximo 3 MB.')

    setUploadingPhoto(true)
    setPhotoError('')
    try {
      const url = await uploadProfilePicture(currentUser.id, file)
      await updateUserProfile(currentUser.id, { profilePicture: url })
      setCurrentUser(prev => ({ ...prev, profilePicture: url }))
    } catch (err) {
      setPhotoError('Erro ao enviar foto. Tente novamente.')
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  if (!currentUser) return (
    <div className="content" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
      <p style={{ color:'#888' }}>Carregando perfil...</p>
    </div>
  )

  return (
    <div className="profile-layout">
      <div className="profile-header">

        <div className="profile-avatar-wrap">
          <img src={currentUser.profilePicture || defaultAvatar} alt="avatar" className="profile-avatar" />
          <button className="profile-avatar-btn" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} title="Trocar foto">
            {uploadingPhoto ? '...' : <FaCamera />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={handlePhotoChange} />
          {photoError && <p className="profile-photo-error">{photoError}</p>}
        </div>

        <div className="profile-info">
          {editing
            ? <input className="profile-edit-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Seu nome" />
            : <h2 className="profile-name">{currentUser.name}</h2>}

          {editing
            ? <textarea className="profile-edit-textarea" value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Sua bio..." rows={2} />
            : <p className="profile-bio">{currentUser.bio || 'Nenhuma bio ainda.'}</p>}

          <div className="profile-meta">
            <span className="profile-meta-item">
              <FaMapMarkerAlt />
              {editing
                ? <input className="profile-edit-input-sm" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} placeholder="Localização" />
                : currentUser.location || 'Não informado'}
            </span>
            <span className="profile-meta-item">
              <FaGraduationCap />
              {editing
                ? <input className="profile-edit-input-sm" value={form.course} onChange={e => setForm(f => ({...f, course: e.target.value}))} placeholder="Curso" />
                : currentUser.course || 'Não informado'}
            </span>
          </div>

          {error && <p className="profile-error">{error}</p>}

          <div className="profile-actions">
            {editing ? (
              <>
                <button className="profile-btn-save" onClick={saveEdit} disabled={saving}><FaCheck /> {saving ? 'Salvando...' : 'Salvar'}</button>
                <button className="profile-btn-cancel" onClick={cancelEdit} disabled={saving}><FaTimes /> Cancelar</button>
              </>
            ) : (
              <button className="profile-btn-edit" onClick={startEdit}><FaEdit /> Editar perfil</button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat"><span className="profile-stat-number">{currentUser.postCount || 0}</span><span className="profile-stat-label">Posts</span></div>
        <div className="profile-stat"><span className="profile-stat-number">{currentUser.followers?.length || 0}</span><span className="profile-stat-label">Seguidores</span></div>
        <div className="profile-stat"><span className="profile-stat-number">{currentUser.following?.length || 0}</span><span className="profile-stat-label">Seguindo</span></div>
      </div>
    </div>
  )
}

export default Profile