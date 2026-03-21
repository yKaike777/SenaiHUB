import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange } from '../firebase'
import { getUser } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)  // dados do Firestore
  const [authUser, setAuthUser]       = useState(null)  // dados do Firebase Auth
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setAuthUser(user)
      if (user) {
        const userData = await getUser(user.uid)
        setCurrentUser(userData)
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, authUser, loading, setCurrentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}