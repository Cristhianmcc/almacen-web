import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, onAuthStateChange, login as authLogin, logout as authLogout } from '../services/auth'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar usuario al iniciar
  useEffect(() => {
    loadUser()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Cleanup
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadUser = async () => {
    try {
      setLoading(true)
      const { user: currentUser } = await getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      console.error('Error cargando usuario:', err)
      setError(err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      const result = await authLogin(email, password)
      
      if (result.success) {
        setUser(result.user)
        return { success: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al iniciar sesión'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      const result = await authLogout()
      
      if (result.success) {
        setUser(null)
        return { success: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al cerrar sesión'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
