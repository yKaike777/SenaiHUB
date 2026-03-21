import { useState } from 'react'
import UserInfo from './UserInfo'
import { FaHeart, FaRegHeart, FaRegCommentDots } from 'react-icons/fa'
import defaultAvatar from '../assets/default-avatar.jpg'

function Post() {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(12)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([
    { name: 'Ana Lima', text: 'Muito bom! 👏', time: '1h atrás' },
  ])

  function handleLike() {
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  function handleComment() {
    if (!comment.trim()) return
    setComments(prev => [...prev, { name: 'Usuário', text: comment, time: 'agora' }])
    setComment('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleComment()
  }

  return (
    <div className="post-container">

      {/* Cabeçalho */}
      <UserInfo />

      {/* Conteúdo do post */}
      <p className="post-content">
        Acabei de terminar o projeto de desenvolvimento web! Foi incrível aprender sobre React e componentização. 🚀
      </p>

      {/* Ação de like */}
      <div className="post-actions">
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          {liked ? <FaHeart /> : <FaRegHeart />}
          <span>{likeCount} curtidas</span>
        </button>
        <span className="comment-count">
          <FaRegCommentDots /> {comments.length} comentários
        </span>
      </div>

      <hr className="post-divider" />

      {/* Seção de comentários */}
      <div className="comments-section">

        <div className="comments-list">
          {comments.map((c, i) => (
            <div key={i} className="comment-item">
              <img src={defaultAvatar} alt="avatar" className="comment-avatar" />
              <div className="comment-bubble">
                <span className="comment-author">{c.name}</span>
                <span className="comment-text">{c.text}</span>
                <span className="comment-time">{c.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="comment-input-area">
          <img src={defaultAvatar} alt="avatar" className="comment-avatar" />
          <input
            type="text"
            className="comment-input"
            placeholder="Escreva um comentário..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="comment-send-btn" onClick={handleComment}>Enviar</button>
        </div>

      </div>
    </div>
  )
}

export default Post