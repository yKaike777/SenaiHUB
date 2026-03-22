import { useState, useEffect, useRef } from 'react'
import { FaPaperPlane, FaUserFriends, FaArrowLeft, FaComments } from 'react-icons/fa'
import defaultAvatar from '../assets/default-avatar.jpg'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { getUsersByIds, sendMessage, subscribeToMessages } from '../firebase'

function Messages() {
  const { currentUser }                       = useAuth()
  const { unread, markAsRead, setOpenConv, clearOpenConv } = useNotifications()
  const [contacts, setContacts]               = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [selected, setSelected]               = useState(null)
  const [messages, setMessages]               = useState([])
  const [input, setInput]                     = useState('')
  const [sending, setSending]                 = useState(false)
  const [mobileView, setMobileView]           = useState('list')
  const [previews, setPreviews]               = useState({})
  const messagesEndRef                        = useRef(null)
  const unsubscribeRef                        = useRef(null)
  const previewUnsubs                         = useRef({})

  useEffect(() => {
    if (!currentUser) return
    const following = currentUser.following || []
    if (!following.length) { setLoadingContacts(false); return }
    getUsersByIds(following)
      .then(users => setContacts(users))
      .catch(console.error)
      .finally(() => setLoadingContacts(false))
  }, [currentUser])

  // Preview da última mensagem de cada contato
  useEffect(() => {
    if (!currentUser || !contacts.length) return
    Object.values(previewUnsubs.current).forEach(fn => fn())
    previewUnsubs.current = {}

    contacts.forEach(contact => {
      const unsub = subscribeToMessages(currentUser.id, contact.id, msgs => {
        if (!msgs.length) return
        setPreviews(prev => ({ ...prev, [contact.id]: msgs[msgs.length - 1] }))
      })
      previewUnsubs.current[contact.id] = unsub
    })

    return () => Object.values(previewUnsubs.current).forEach(fn => fn())
  }, [contacts, currentUser])

  // Listener da conversa aberta
  useEffect(() => {
    if (!selected || !currentUser) return
    if (unsubscribeRef.current) unsubscribeRef.current()
    setMessages([])
    const unsub = subscribeToMessages(currentUser.id, selected.id, setMessages)
    unsubscribeRef.current = unsub
    return () => unsub()
  }, [selected, currentUser])

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current()
      clearOpenConv()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function selectContact(contact) {
    setSelected(contact)
    setMobileView('chat')
    markAsRead(contact.id)   // limpa badge do aside e da lista
    setOpenConv(contact.id)  // informa o contexto que essa conversa está aberta
  }

  function goBackToList() {
    setMobileView('list')
    clearOpenConv()
  }

  async function handleSend() {
    if (!input.trim() || !selected || !currentUser || sending) return
    setSending(true)
    try {
      await sendMessage(currentUser.id, selected.id, input.trim())
      setInput('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  function formatTime(timestamp) {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="messages-layout">

      {/* ── LISTA DE CONTATOS ── */}
      <aside className={`contacts-list ${mobileView === 'chat' ? 'contacts-hidden-mobile' : ''}`}>
        <h2 className="contacts-title">Mensagens</h2>

        {loadingContacts && (
          <p style={{ padding: '16px', color: 'var(--text-3)', fontSize: '9.5pt' }}>Carregando...</p>
        )}

        {!loadingContacts && contacts.length === 0 && (
          <div className="contacts-empty">
            <FaUserFriends />
            <p>Siga alguém para iniciar uma conversa.</p>
          </div>
        )}

        {contacts.map(contact => {
          const count   = unread[contact.id] || 0
          const preview = previews[contact.id]
          const hasNew  = count > 0

          return (
            <div
              key={contact.id}
              className={`contact-item ${selected?.id === contact.id ? 'contact-active' : ''} ${hasNew ? 'contact-has-unread' : ''}`}
              onClick={() => selectContact(contact)}
            >
              <div className="contact-avatar-wrap">
                <img
                  src={contact.profilePicture || defaultAvatar}
                  alt="avatar"
                  className="contact-avatar"
                />
                {hasNew && <span className="contact-unread-dot" />}
              </div>
              <div className="contact-info">
                <span className={`contact-name ${hasNew ? 'contact-name-bold' : ''}`}>
                  {contact.name}
                </span>
                <span className={`contact-last ${hasNew ? 'contact-last-bold' : ''}`}>
                  {preview
                    ? (preview.senderId === currentUser?.id
                        ? `Você: ${preview.content}`
                        : preview.content)
                    : contact.course}
                </span>
              </div>
              {hasNew && (
                <span className="contact-unread-badge">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </div>
          )
        })}
      </aside>

      {/* ── JANELA DE CONVERSA ── */}
      <div className={`chat-window ${mobileView === 'list' ? 'chat-hidden-mobile' : ''}`}>

        {!selected && !loadingContacts && (
          <div className="chat-empty">
            <FaComments style={{ fontSize: '32pt', marginBottom: '12px', opacity: 0.2 }} />
            <p>{contacts.length === 0 ? 'Siga alguém para conversar' : 'Selecione uma conversa'}</p>
          </div>
        )}

        {selected && (
          <>
            <div className="chat-header">
              <button className="chat-back-btn" onClick={goBackToList}>
                <FaArrowLeft />
              </button>
              <img
                src={selected.profilePicture || defaultAvatar}
                alt="avatar"
                className="contact-avatar"
              />
              <div>
                <span className="chat-header-name">{selected.name}</span>
                <span className="chat-header-course">{selected.course}</span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '9.5pt', margin: 'auto' }}>
                  Comece a conversa!
                </p>
              )}
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`chat-bubble-wrap ${msg.senderId === currentUser?.id ? 'mine' : 'theirs'}`}
                >
                  <div className={`chat-bubble ${msg.senderId === currentUser?.id ? 'bubble-mine' : 'bubble-theirs'} ${msg.senderId !== currentUser?.id ? 'bubble-new' : ''}`}>
                    {msg.content}
                    <span className="bubble-time">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="Digite uma mensagem..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={sending}
              />
              <button
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || sending}
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  )
}

export default Messages