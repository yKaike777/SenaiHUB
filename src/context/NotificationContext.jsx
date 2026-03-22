import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useAuth } from './AuthContext'
import { getUsersByIds, subscribeToMessages } from '../firebase'

const NotificationContext = createContext(null)

function getReadKey(uid, contactId) {
  return `read_${uid}_${contactId}`
}

function getLastRead(uid, contactId) {
  const val = localStorage.getItem(getReadKey(uid, contactId))
  return val ? Number(val) : 0
}

function saveLastRead(uid, contactId, timestamp) {
  // Salva o timestamp da última mensagem lida (não Date.now())
  localStorage.setItem(getReadKey(uid, contactId), String(timestamp))
}

function getMsgTimestamp(msg) {
  if (!msg?.createdAt) return null
  if (msg.createdAt.toDate) return msg.createdAt.toDate().getTime()
  if (msg.createdAt.seconds) return msg.createdAt.seconds * 1000
  return null
}

export function NotificationProvider({ children }) {
  const { currentUser }         = useAuth()
  const [unread, setUnread]     = useState({})
  const [contacts, setContacts] = useState([])
  const previewUnsubs           = useRef({})
  const openConvRef             = useRef(null)

  // Limpa e recarrega ao trocar de usuário
  useEffect(() => {
    Object.values(previewUnsubs.current).forEach(fn => fn())
    previewUnsubs.current = {}
    setUnread({})
    setContacts([])
    openConvRef.current = null

    if (!currentUser?.id || !currentUser?.following?.length) return

    getUsersByIds(currentUser.following)
      .then(setContacts)
      .catch(console.error)
  }, [currentUser?.id])

  // Abre listeners para cada contato
  useEffect(() => {
    if (!currentUser?.id || !contacts.length) return

    Object.values(previewUnsubs.current).forEach(fn => fn())
    previewUnsubs.current = {}

    contacts.forEach(contact => {
      const unsub = subscribeToMessages(currentUser.id, contact.id, msgs => {
        if (!msgs.length) return

        const lastRead = getLastRead(currentUser.id, contact.id)

        // Filtra mensagens recebidas (não enviadas pelo usuário atual)
        // com timestamp definido e maior que o último lido
        const unreadMsgs = msgs.filter(m => {
          if (m.senderId === currentUser.id) return false
          const ts = getMsgTimestamp(m)
          // Se não tem timestamp ainda (acabou de ser enviada pelo servidor),
          // ignora — vai ser contada quando o timestamp chegar
          if (ts === null) return false
          return ts > lastRead
        })

        setUnread(prev => {
          if (openConvRef.current === contact.id) return prev
          return { ...prev, [contact.id]: unreadMsgs.length }
        })
      })

      previewUnsubs.current[contact.id] = unsub
    })

    return () => {
      Object.values(previewUnsubs.current).forEach(fn => fn())
    }
  }, [contacts, currentUser?.id])

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0)

  function markAsRead(contactId) {
    if (!currentUser?.id) return

    // Salva o timestamp da mensagem mais recente da conversa como "lida"
    // Para isso precisamos do maior timestamp das mensagens recebidas
    // Usamos Date.now() como aproximação segura (maior que qualquer msg existente)
    saveLastRead(currentUser.id, contactId, Date.now())
    setUnread(prev => ({ ...prev, [contactId]: 0 }))
    openConvRef.current = contactId
  }

  function setOpenConv(contactId) {
    openConvRef.current = contactId
  }

  function clearOpenConv() {
    openConvRef.current = null
  }

  return (
    <NotificationContext.Provider value={{
      unread,
      totalUnread,
      markAsRead,
      setOpenConv,
      clearOpenConv,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}