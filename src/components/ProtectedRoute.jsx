import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) return null // AuthContext ainda está verificando a sessão

  if (!currentUser) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute