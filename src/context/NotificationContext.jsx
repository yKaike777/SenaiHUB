import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useAuth } from './AuthContext'
import { getUsersByIds, subscribeToMessages } from '../firebase'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { currentUser }             = useAuth()
  const [unread, setUnread]         = useState({})   // { contactId: count }
  const [contacts, setContacts]     = useState([])
  const previewUnsubs               = useRef({})
  const openConvRef                 = useRef(null)   // id da conversa aberta no momento

  // Carrega contatos (seguidos) sempre que o usuário mudar
  useEffect(() => {
    if (!currentUser?.following?.length) { setContacts([]); return }
    getUsersByIds(currentUser.following)
      .then(setContacts)
      .catch(console.error)
  }, [currentUser?.id, currentUser?.following?.length])

  // Abre um listener por contato para detectar mensagens novas
  useEffect(() => {
    if (!currentUser || !contacts.length) return

    Object.values(previewUnsubs.current).forEach(fn => fn())
    previewUnsubs.current = {}

    // Guarda última mensagem conhecida por contato para comparar
    const lastKnown = {}

    contacts.forEach(contact => {
      let initialized = false

      const unsub = subscribeToMessages(currentUser.id, contact.id, msgs => {
        if (!msgs.length) { initialized = true; return }

        const last = msgs[msgs.length - 1]

        // Na primeira execução só registra o estado atual, não conta como nova
        if (!initialized) {
          lastKnown[contact.id] = last.id
          initialized = true
          return
        }

        // Mensagem nova recebida de outra pessoa
        if (
          last.id !== lastKnown[contact.id] &&
          last.senderId !== currentUser.id
        ) {
          lastKnown[contact.id] = last.id

          // Só incrementa se a conversa com esse contato não estiver aberta
          if (openConvRef.current !== contact.id) {
            setUnread(prev => ({
              ...prev,
              [contact.id]: (prev[contact.id] || 0) + 1,
            }))
          }
        }
      })

      previewUnsubs.current[contact.id] = unsub
    })

    return () => {
      Object.values(previewUnsubs.current).forEach(fn => fn())
    }
  }, [contacts, currentUser?.id])

  // Total de mensagens não lidas (para o badge do aside)
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0)

  // Marca uma conversa como lida
  function markAsRead(contactId) {
    setUnread(prev => ({ ...prev, [contactId]: 0 }))
    openConvRef.current = contactId
  }

  // Registra qual conversa está aberta (para não contar como não lida)
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