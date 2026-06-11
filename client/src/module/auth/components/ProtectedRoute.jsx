import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/auth.store'

/**
 * Wrap any route that requires authentication.
 * If not logged in, redirect to /login.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
