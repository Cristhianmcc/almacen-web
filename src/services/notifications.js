import axios from 'axios'
import mockService from './notificationsMock'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://almacen-instituto.onrender.com/api'
// En producción SIEMPRE usa el servicio real
const USE_MOCK = import.meta.env.MODE === 'production' ? false : (import.meta.env.VITE_USE_MOCK_NOTIFICATIONS !== 'false')

class NotificationService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (USE_MOCK) {
      console.log('🔧 [NOTIFICACIONES] Usando servicio MOCK (backend no implementado)')
      console.log('💡 Para usar el backend real, configura VITE_USE_MOCK_NOTIFICATIONS=false en .env')
    } else {
      console.log('✅ [NOTIFICACIONES] Usando servicio REAL del backend')
      console.log('🌐 API URL:', BASE_URL)
    }
  }

  /**
   * Obtener todas las alertas detectadas del sistema
   * @returns {Promise} Array de alertas
   */
  async getAlertas() {
    try {
      const response = await this.client.get('/alertas')
      return response.data
    } catch (error) {
      console.error('Error al obtener alertas:', error)
      throw error
    }
  }

  /**
   * Detectar productos con stock bajo
   * @param {Array} productos - Lista de productos
   * @returns {Array} Productos con stock bajo
   */
  detectarStockBajo(productos) {
    return productos.filter(p => {
      const stock = Number(p.quantity) || 0
      const minStock = Number(p.min_stock) || 0
      return stock > 0 && stock <= minStock
    })
  }

  /**
   * Detectar productos próximos a vencer (7 días o menos)
   * @param {Array} productos - Lista de productos
   * @returns {Array} Productos próximos a vencer
   */
  detectarProximosVencer(productos) {
    const hoy = new Date()
    const limite = new Date()
    limite.setDate(hoy.getDate() + 7)

    return productos.filter(p => {
      if (!p.expiry_date || p.status === 'vencido') return false
      
      const fechaVencimiento = new Date(p.expiry_date)
      return fechaVencimiento > hoy && fechaVencimiento <= limite
    })
  }

  /**
   * Detectar productos vencidos
   * @param {Array} productos - Lista de productos
   * @returns {Array} Productos vencidos
   */
  detectarVencidos(productos) {
    const hoy = new Date()
    
    return productos.filter(p => {
      if (!p.expiry_date) return false
      
      const fechaVencimiento = new Date(p.expiry_date)
      return fechaVencimiento < hoy || p.status === 'vencido'
    })
  }

  /**
   * Generar resumen completo de alertas
   * @param {Array} productos - Lista de productos
   * @returns {Object} Resumen con todas las alertas
   */
  generarResumenAlertas(productos) {
    const stockBajo = this.detectarStockBajo(productos)
    const proximosVencer = this.detectarProximosVencer(productos)
    const vencidos = this.detectarVencidos(productos)

    return {
      total: stockBajo.length + proximosVencer.length + vencidos.length,
      stockBajo: {
        cantidad: stockBajo.length,
        productos: stockBajo
      },
      proximosVencer: {
        cantidad: proximosVencer.length,
        productos: proximosVencer
      },
      vencidos: {
        cantidad: vencidos.length,
        productos: vencidos
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Enviar notificación por email (endpoint del backend)
   * @param {Object} data - Datos de la notificación
   * @returns {Promise} Respuesta del servidor
   */
  async enviarNotificacion(data) {
    if (USE_MOCK) {
      return mockService.enviarNotificacion(data)
    }

    try {
      const response = await this.client.post('/notificaciones/enviar', {
        email: data.email,
        tipo: data.tipo, // 'stock_bajo', 'vencimiento_proximo', 'vencido', 'resumen_diario'
        asunto: data.asunto,
        mensaje: data.mensaje,
        productos: data.productos || []
      })
      return response.data
    } catch (error) {
      console.error('Error al enviar notificación:', error)
      throw error
    }
  }

  /**
   * Configurar preferencias de notificaciones del usuario
   * @param {Object} preferencias - Configuración de notificaciones
   * @returns {Promise} Respuesta del servidor
   */
  async guardarPreferencias(preferencias) {
    if (USE_MOCK) {
      return mockService.guardarPreferencias(preferencias)
    }

    try {
      const response = await this.client.post('/notificaciones/preferencias', {
        email: preferencias.email,
        habilitado: preferencias.habilitado,
        hora_envio: preferencias.horaEnvio || '08:00',
        alertas: {
          stock_bajo: preferencias.alertas?.stockBajo ?? true,
          vencimiento_proximo: preferencias.alertas?.vencimientoProximo ?? true,
          vencidos: preferencias.alertas?.vencidos ?? true,
          resumen_diario: preferencias.alertas?.resumenDiario ?? false
        },
        umbral_dias: preferencias.umbralDias || 7 // Días antes del vencimiento
      })
      return response.data
    } catch (error) {
      console.error('Error al guardar preferencias:', error)
      throw error
    }
  }

  /**
   * Obtener preferencias de notificaciones
   * @param {string} email - Email del usuario (opcional)
   * @returns {Promise} Preferencias guardadas
   */
  async obtenerPreferencias(email = null) {
    if (USE_MOCK) {
      return mockService.obtenerPreferencias()
    }

    try {
      const params = email ? { email } : {}
      const response = await this.client.get('/notificaciones/preferencias', { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener preferencias:', error)
      throw error
    }
  }

  /**
   * Probar envío de email (envía un email de prueba)
   * @param {string} email - Email de destino
   * @returns {Promise} Respuesta del servidor
   */
  async probarEmail(email) {
    if (USE_MOCK) {
      return mockService.probarEmail(email)
    }

    try {
      const response = await this.client.post('/notificaciones/test', { email })
      return response.data
    } catch (error) {
      console.error('Error al probar email:', error)
      throw error
    }
  }
}

export default new NotificationService()
