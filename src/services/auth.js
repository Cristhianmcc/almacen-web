import { supabase } from './supabaseClient'

/**
 * Servicio de Autenticación con Supabase
 */

// Login con email y password
export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    console.log('✅ Login exitoso:', data.user.email)
    return { success: true, user: data.user, session: data.session }
  } catch (error) {
    console.error('❌ Error en login:', error.message)
    return { success: false, error: error.message }
  }
}

// Logout
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    console.log('✅ Logout exitoso')
    return { success: true }
  } catch (error) {
    console.error('❌ Error en logout:', error.message)
    return { success: false, error: error.message }
  }
}

// Obtener usuario actual
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error
    
    return { success: true, user }
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error.message)
    return { success: false, error: error.message, user: null }
  }
}

// Obtener sesión actual
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    return { success: true, session }
  } catch (error) {
    console.error('❌ Error al obtener sesión:', error.message)
    return { success: false, error: error.message, session: null }
  }
}

// Listener para cambios de autenticación
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔔 Auth state changed:', event)
    callback(event, session)
  })
}

// Verificar si el usuario está autenticado
export const isAuthenticated = async () => {
  const { session } = await getSession()
  return !!session
}

export default {
  login,
  logout,
  getCurrentUser,
  getSession,
  onAuthStateChange,
  isAuthenticated
}
