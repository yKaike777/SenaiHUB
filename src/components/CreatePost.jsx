import { useRef, useState } from 'react'
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaPaperPlane } from 'react-icons/fa'
import UserInfo from './UserInfo'
import { useAuth } from '../context/AuthContext'
import { createPost } from '../firebase'

const FORMAT_ACTIONS = [
  { cmd: 'bold',          icon: <FaBold />,          title: 'Negrito (Ctrl+B)'    },
  { cmd: 'italic',        icon: <FaItalic />,        title: 'Itálico (Ctrl+I)'    },
  { cmd: 'underline',     icon: <FaUnderline />,     title: 'Sublinhado (Ctrl+U)' },
  { cmd: 'strikeThrough', icon: <FaStrikethrough />, title: 'Tachado'             },
]

function CreatePost({ onPostCreated }) {
  const { currentUser }               = useAuth()
  const editorRef                     = useRef(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [isEmpty, setIsEmpty]         = useState(true)
  const [activeFormats, setActiveFormats] = useState({})

  function applyFormat(cmd) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, null)
    updateActiveFormats()
  }

  function updateActiveFormats() {
    setActiveFormats({
      bold:          document.queryCommandState('bold'),
      italic:        document.queryCommandState('italic'),
      underline:     document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
    })
  }

  function handleInput() {
    const text = editorRef.current?.innerText?.trim() || ''
    setIsEmpty(text.length === 0)
    updateActiveFormats()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && e.ctrlKey) handlePost()
  }

  async function handlePost() {
    const html = editorRef.current?.innerHTML?.trim() || ''
    const text = editorRef.current?.innerText?.trim() || ''
    if (!text || !currentUser) return

    setLoading(true)
    setError('')
    try {
      await createPost({
        authorId:      currentUser.id,
        authorName:    currentUser.name,
        authorPicture: currentUser.profilePicture || '',
        authorCourse:  currentUser.course || '',   // ← campo adicionado
        content:       html,
      })
      editorRef.current.innerHTML = ''
      setIsEmpty(true)
      onPostCreated?.()
    } catch (err) {
      setError('Erro ao publicar. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="createPost-container">
      <UserInfo />

      <div
        ref={editorRef}
        className={`post-editor ${isEmpty ? 'post-editor-empty' : ''}`}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onKeyDown={handleKeyDown}
        data-placeholder="No que você está pensando?"
        spellCheck
      />

      {error && <p className="post-error">{error}</p>}

      <div className="button-area">
        <div className="format-icons">
          {FORMAT_ACTIONS.map(({ cmd, icon, title }) => (
            <button
              key={cmd}
              className={`f-icon ${activeFormats[cmd] ? 'f-icon-active' : ''}`}
              onMouseDown={e => { e.preventDefault(); applyFormat(cmd) }}
              title={title}
              type="button"
            >
              {icon}
            </button>
          ))}
        </div>
        <button
          className="post-btn"
          onClick={handlePost}
          disabled={loading || isEmpty}
        >
          {loading ? 'Publicando...' : <><FaPaperPlane /> Postar</>}
        </button>
      </div>
    </div>
  )
}

export default CreatePost