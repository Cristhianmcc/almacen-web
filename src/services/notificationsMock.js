/**
 * MOCK SERVICE - Simulador del Backend de Notificaciones
 * Este servicio simula las respuestas del backend sin necesidad de implementarlo
 * Úsalo para probar la funcionalidad mientras implementas el backend real
 */

// Simular delay de red
const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

// Almacenamiento local simulado
const STORAGE_KEY = 'notification_preferences_mock'
const LOG_KEY = 'notifications_log_mock'

class NotificationsMockService {
  
  /**
   * Guardar preferencias (simula POST /notificaciones/preferencias)
   */
  async guardarPreferencias(preferencias) {
    console.log('🔄 [MOCK] Guardando preferencias...', preferencias)
    await delay(800)
    
    // Simular validación
    if (!preferencias.email) {
      throw new Error('Email es requerido')
    }

    // Guardar en localStorage
    const data = {
      ...preferencias,
      user_id: 'mock-user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    
    console.log('✅ [MOCK] Preferencias guardadas correctamente')
    return {
      success: true,
      data,
      message: 'Preferencias guardadas correctamente (MOCK)'
    }
  }

  /**
   * Obtener preferencias (simula GET /notificaciones/preferencias)
   */
  async obtenerPreferencias() {
    console.log('🔄 [MOCK] Obteniendo preferencias...')
    await delay(500)

    const stored = localStorage.getItem(STORAGE_KEY)
    
    if (!stored) {
      console.log('ℹ️ [MOCK] No hay preferencias guardadas')
      return null
    }

    const data = JSON.parse(stored)
    console.log('✅ [MOCK] Preferencias obtenidas:', data)
    
    return data
  }

  /**
   * Probar envío de email (simula POST /notificaciones/test)
   */
  async probarEmail(email) {
    console.log('🔄 [MOCK] Enviando email de prueba a:', email)
    await delay(1500)

    // Simular validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido')
    }

    // Simular éxito (90% de probabilidad)
    const success = Math.random() > 0.1

    if (!success) {
      throw new Error('Error simulado al enviar email. Intenta de nuevo.')
    }

    // Guardar en log
    this._guardarEnLog({
      email,
      tipo: 'test',
      asunto: 'Email de Prueba - Sistema de Notificaciones',
      estado: 'enviado',
      timestamp: new Date().toISOString()
    })

    console.log('✅ [MOCK] Email de prueba enviado correctamente')
    console.log('📧 [MOCK] Revisa la consola para ver el contenido del email')
    
    // Mostrar el email en consola
    this._mostrarEmailEnConsola(email, 'test')

    return {
      success: true,
      data: {
        id: `mock-email-${Date.now()}`,
        to: email,
        subject: '✅ Email de Prueba - Sistema de Notificaciones'
      },
      message: 'Email de prueba enviado correctamente (MOCK)'
    }
  }

  /**
   * Enviar notificación (simula POST /notificaciones/enviar)
   */
  async enviarNotificacion(data) {
    console.log('🔄 [MOCK] Enviando notificación...', data)
    await delay(1200)

    // Validaciones
    if (!data.email) throw new Error('Email es requerido')
    if (!data.tipo) throw new Error('Tipo de notificación es requerido')

    // Simular envío
    const success = Math.random() > 0.05

    if (!success) {
      throw new Error('Error simulado al enviar notificación')
    }

    // Guardar en log
    this._guardarEnLog({
      email: data.email,
      tipo: data.tipo,
      asunto: data.asunto,
      estado: 'enviado',
      productos_afectados: data.productos?.length || 0,
      timestamp: new Date().toISOString()
    })

    // Mostrar email en consola
    this._mostrarEmailEnConsola(data.email, data.tipo, data.productos)

    console.log('✅ [MOCK] Notificación enviada correctamente')

    return {
      success: true,
      data: {
        id: `mock-notification-${Date.now()}`,
        to: data.email,
        subject: data.asunto
      }
    }
  }

  /**
   * Obtener log de notificaciones
   */
  getLog() {
    const log = localStorage.getItem(LOG_KEY)
    return log ? JSON.parse(log) : []
  }

  /**
   * Limpiar log de notificaciones
   */
  clearLog() {
    localStorage.removeItem(LOG_KEY)
    console.log('🗑️ [MOCK] Log de notificaciones limpiado')
  }

  /**
   * Limpiar preferencias
   */
  clearPreferencias() {
    localStorage.removeItem(STORAGE_KEY)
    console.log('🗑️ [MOCK] Preferencias limpiadas')
  }

  // ========== MÉTODOS PRIVADOS ==========

  _guardarEnLog(entry) {
    const log = this.getLog()
    log.push(entry)
    localStorage.setItem(LOG_KEY, JSON.stringify(log))
  }

  _mostrarEmailEnConsola(email, tipo, productos = []) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 EMAIL ENVIADO (SIMULACIÓN)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📬 Para: ${email}`)
    console.log(`📋 Tipo: ${tipo}`)
    console.log(`🕐 Fecha: ${new Date().toLocaleString('es-PE')}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    if (tipo === 'test') {
      console.log(`
🎉 ¡Prueba Exitosa!

Este es un email de prueba del sistema de notificaciones de Almacén Lurín.

Si recibiste este mensaje, significa que tu configuración está correcta y 
empezarás a recibir alertas automáticas sobre:

• 📉 Productos con stock bajo
• ⏰ Productos próximos a vencer
• ❌ Productos vencidos
• 📊 Resumen diario del inventario

Este es un mensaje automático, por favor no responder.
      `)
    } else if (productos.length > 0) {
      console.log('\n📦 Productos afectados:')
      productos.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - Stock: ${p.quantity}`)
      })
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }
}

export default new NotificationsMockService()
