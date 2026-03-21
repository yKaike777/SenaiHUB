import { useState, useEffect, useRef } from 'react'
import { FaHeart, FaRegHeart, FaRegCommentDots, FaEllipsisH, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa'
import UserInfo from './UserInfo'
import defaultAvatar from '../assets/default-avatar.jpg'
import { useAuth } from '../context/AuthContext'
import { toggleLike, addComment, subscribeToComments, updatePost, deletePost } from '../firebase'

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

  const liked      = currentUser && post.likes?.[currentUser.id]
  const likeCount  = post.likeCount || 0
  const isAuthor   = currentUser?.id === post.authorId

  // Fecha o menu ao clicar fora
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

  // Foca o editor ao abrir edição
  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      // Coloca o cursor no final
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
    // Preenche o editor com o conteúdo atual
    setTimeout(() => {
      if (editRef.current) editRef.current.innerHTML = post.content
    }, 0)
  }

  function cancelEdit() {
    setEditing(false)
  }

  async function handleSaveEdit() {
    const html = editRef.current?.innerHTML?.trim() || ''
    const text = editRef.current?.innerText?.trim() || ''
    if (!text) return
    setSaving(true)
    try {
      await updatePost(post.id, html)
      setEditing(false)
    } catch (err) {
      console.error('Erro ao editar post:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await deletePost(post.id)
      onDeleted?.(post.id)
    } catch (err) {
      console.error('Erro ao excluir post:', err)
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

      {/* Cabeçalho: UserInfo + menu de 3 pontos */}
      <div className="post-header">
        <UserInfo user={postAuthor} date={post.createdAt} />

        {isAuthor && (
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
                  <button
                    className="post-menu-item post-menu-cancel"
                    onClick={() => setConfirmDelete(false)}
                  >
                    <FaTimes /> Cancelar
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo — normal ou em edição */}
      {editing ? (
        <div className="post-edit-wrap">
          <div
            ref={editRef}
            className="post-editor post-editor-edit"
            contentEditable
            suppressContentEditableWarning
            spellCheck
          />
          <div className="post-edit-actions">
            {post.editedAt && (
              <span className="post-edited-badge">editado</span>
            )}
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
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {post.editedAt && (
            <span className="post-edited-label">editado</span>
          )}
        </div>
      )}

      {/* Ações */}
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

      {/* Comentários */}
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