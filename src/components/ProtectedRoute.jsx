import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si está autenticado, mostrar el contenido
  return children
}

export default ProtectedRoute
