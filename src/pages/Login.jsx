import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido')
      return
    }

    try {
      setError('')
      setLoading(true)
      
      const result = await login(email, password)
      
      if (result.success) {
        console.log('✅ Login exitoso, redirigiendo...')
        navigate('/')
      } else {
        setError(result.error || 'Credenciales incorrectas')
      }
    } catch (err) {
      console.error('Error en login:', err)
      setError('Error al iniciar sesión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">📦</div>
          <h1>Sistema de Almacén</h1>
          <p>Instituto Educativo</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@instituto.edu"
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                <span>🔑</span>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Sistema de Gestión de Almacén v1.0</p>
          <p className="login-hint">
            💡 Si no tienes acceso, contacta al administrador
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
