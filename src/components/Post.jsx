import { useState, useEffect, useRef } from 'react'
import { FaHeart, FaRegHeart, FaRegCommentDots, FaEllipsisH, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa'
import UserInfo from './UserInfo'
import defaultAvatar from '../assets/default-avatar.jpg'
import { useAuth } from '../context/AuthContext'
import { toggleLike, addComment, subscribeToComments, updatePost, deletePost } from '../firebase'

import { isAdmin as checkAdmin } from '../utils/adminConfig'

function Post({ post, onDeleted }) {
  const { currentUser }           = useAuth()
  const [comments, setComments]   = useState([])
  const [comment, setComment]     = useState('')
  const [sending, setSending]     = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef                   = useRef(null)
  const editRef                   = useRef(null)

  const liked    = currentUser && post.likes?.[currentUser.id]
  const likeCount = post.likeCount || 0
  const isAuthor  = currentUser?.id === post.authorId
  const isAdmin   = checkAdmin(currentUser?.email)
  const canManage = isAuthor || isAdmin

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
        setConfirmDelete(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOpen])

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      const range = document.createRange()
      const sel   = window.getSelection()
      range.selectNodeContents(editRef.current)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }, [editing])

  useEffect(() => {
    if (!post?.id) return
    const unsub = subscribeToComments(post.id, setComments)
    return () => unsub()
  }, [post?.id])

  async function handleLike() {
    if (!currentUser) return
    try { await toggleLike(post.id, currentUser.id) }
    catch (err) { console.error(err) }
  }

  async function handleComment() {
    if (!comment.trim() || !currentUser) return
    setSending(true)
    try {
      await addComment(post.id, {
        authorId:      currentUser.id,
        authorName:    currentUser.name,
        authorPicture: currentUser.profilePicture || '',
        content:       comment.trim(),
      })
      setComment('')
    } catch (err) { console.error(err) }
    finally { setSending(false) }
  }

  function startEdit() {
    setMenuOpen(false)
    setEditing(true)
  }

  function handleEditRefMount(node) {
    editRef.current = node
    if (node && !node.innerHTML) {
      node.innerHTML = post.content || ''
    }
  }

  function cancelEdit() { setEditing(false) }

  async function handleSaveEdit() {
    const node = editRef.current
    if (!node) return
    const html = node.innerHTML?.trim() || ''
    const text = node.innerText?.trim() || ''
    if (!text) return
    setSaving(true)
    try {
      await updatePost(post.id, html)
      setEditing(false)
    } catch (err) {
      console.error('Erro ao salvar edicao:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await deletePost(post.id)
      onDeleted?.(post.id)
    } catch (err) {
      console.error(err)
      setDeleting(false)
    }
  }

  const postAuthor = {
    name:           post.authorName,
    profilePicture: post.authorPicture,
    course:         post.authorCourse || '',
  }

  return (
    <div className="post-container">

      <div className="post-header">
        <UserInfo user={postAuthor} date={post.createdAt} userId={post.authorId} />

        {canManage && (
          <div className="post-menu-wrap" ref={menuRef}>
            <button
              className="post-menu-btn"
              onClick={() => { setMenuOpen(o => !o); setConfirmDelete(false) }}
              title="Opções"
            >
              <FaEllipsisH />
            </button>

            {menuOpen && (
              <div className="post-menu-popup">
                <button className="post-menu-item" onClick={startEdit}>
                  <FaEdit /> Editar
                </button>
                <button
                  className={`post-menu-item post-menu-item-danger ${confirmDelete ? 'confirming' : ''}`}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <FaTrash />
                  {deleting ? 'Excluindo...' : confirmDelete ? 'Confirmar exclusão' : 'Excluir'}
                </button>
                {confirmDelete && (
                  <button className="post-menu-item post-menu-cancel" onClick={() => setConfirmDelete(false)}>
                    <FaTimes /> Cancelar
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="post-edit-wrap">
          <div
            ref={handleEditRefMount}
            className="post-editor post-editor-edit"
            contentEditable
            suppressContentEditableWarning
            spellCheck
          />
          <div className="post-edit-actions">
            {post.editedAt && <span className="post-edited-badge">editado</span>}
            <button className="post-edit-cancel" onClick={cancelEdit} disabled={saving}>
              <FaTimes /> Cancelar
            </button>
            <button className="post-edit-save" onClick={handleSaveEdit} disabled={saving}>
              <FaCheck /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="post-content-wrap">
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          {post.editedAt && <span className="post-edited-label">editado</span>}
        </div>
      )}

      <div className="post-actions">
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          {liked ? <FaHeart /> : <FaRegHeart />}
          <span>{likeCount} curtida{likeCount !== 1 ? 's' : ''}</span>
        </button>
        <span className="comment-count">
          <FaRegCommentDots /> {post.commentCount || 0} comentário{post.commentCount !== 1 ? 's' : ''}
        </span>
      </div>

      <hr className="post-divider" />

      <div className="comments-section">
        {comments.length > 0 && (
          <div className="comments-list">
            {comments.map(c => (
              <div key={c.id} className="comment-item">
                <img src={c.authorPicture || defaultAvatar} alt="avatar" className="comment-avatar" />
                <div className="comment-bubble">
                  <span className="comment-author">{c.authorName}</span>
                  <span className="comment-text">{c.content}</span>
                  {c.createdAt && <span className="comment-time">{formatDate(c.createdAt)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="comment-input-area">
          <img src={currentUser?.profilePicture || defaultAvatar} alt="avatar" className="comment-avatar" />
          <input
            type="text"
            className="comment-input"
            placeholder="Escreva um comentário..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleComment()}
            disabled={sending}
          />
          <button className="comment-send-btn" onClick={handleComment} disabled={sending || !comment.trim()}>
            {sending ? '...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(ts) {
  if (!ts) return ''
  const d    = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Math.floor((Date.now() - d) / 60000)
  if (diff < 1)    return 'agora'
  if (diff < 60)   return `${diff}min atrás`
  if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`
  return `${Math.floor(diff / 1440)}d atrás`
}

export default Post