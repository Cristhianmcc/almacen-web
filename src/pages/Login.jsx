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
        // Traducir mensajes de error comunes al español
        let errorMessage = result.error || 'Credenciales incorrectas'
        
        // Detectar y traducir errores de Supabase
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales de acceso inválidas'
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Email no confirmado'
        } else if (errorMessage.includes('Invalid email')) {
          errorMessage = 'Email inválido'
        } else if (errorMessage.includes('User not found')) {
          errorMessage = 'Usuario no encontrado'
        }
        
        setError(errorMessage)
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
        <div className="avatar-container">
          <div className="avatar-circle">
            <span className="avatar-icon">👤</span>
          </div>
          <h2 className="user-greeting">Bienvenido</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="input-group">
            <span className="input-icon">�</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username"
              disabled={loading}
              autoComplete="email"
              autoFocus
              className="login-input"
            />
          </div>

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
              autoComplete="current-password"
              className="login-input"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          
        </form>

       
      </div>
    </div>
  )
}

export default Login
