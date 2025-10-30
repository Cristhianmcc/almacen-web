import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://almacen-instituto.onrender.com/api'

class ApiResponse {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000, // Aumentado a 30 segundos
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('[API] Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response ${response.status}:`, response.data)
        return response
      },
      (error) => {
        console.error('[API] Response error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // Transformar nombres de campos del backend al frontend
  _transformProduct(product) {
    if (!product) return null
    return {
      id: product.id,
      code: product.codigo_item,
      name: product.nombre_item,
      brand: product.nombre_marca,
      purchase_order: product.orden_compra,
      unit: product.nombre_medida,
      mayor: product.mayor,
      sub_account: product.sub_cta,
      quantity: product.stock_actual,
      // FIX: El backend no tiene campo stock_minimo
      // Usar stock_minimo si existe, sino usar un valor por defecto razonable
      min_stock: product.stock_minimo || 50, // Stock mínimo por defecto: 50 unidades
      entry_date: product.fecha_ingreso,
      expiry_date: product.fecha_vencimiento,
      status: product.estado,
      created_at: product.created_at,
      updated_at: product.updated_at
    }
  }

  // Transformar movimientos del backend al frontend
  _transformMovement(movement) {
    if (!movement) return null
    return {
      id: movement.id,
      product_id: movement.producto_id,
      product_name: movement.productos?.nombre_item || 'Sin nombre',
      product_code: movement.productos?.codigo_item || 'N/A',
      type: movement.tipo_movimiento,
      quantity: movement.cantidad,
      date: movement.fecha_movimiento,
      user: movement.usuario,
      observations: movement.observaciones,
      previous_stock: movement.stock_anterior,
      new_stock: movement.stock_post_movimiento || movement.stock_posterior,
      reason: movement.motivo,
      destination: movement.destino,
      created_at: movement.created_at
    }
  }

  // Transformar bajas (withdrawals) del backend al frontend
  _transformWithdrawal(withdrawal) {
    if (!withdrawal) return null
    return {
      id: withdrawal.id,
      product_id: withdrawal.producto_id,
      product_code: withdrawal.productos?.codigo_item || 'N/A',
      product_name: withdrawal.productos?.nombre_item || 'Sin nombre',
      reason: withdrawal.motivo_baja || 'Sin especificar',
      quantity: withdrawal.cantidad_baja,
      date: withdrawal.fecha_baja,
      user: withdrawal.usuario,
      observations: withdrawal.observaciones,
      value_loss: withdrawal.valor_perdida,
      created_at: withdrawal.created_at
    }
  }

  // Transformar sobrantes (surplus) del backend al frontend
  _transformSurplus(surplus) {
    if (!surplus) return null
    return {
      id: surplus.id,
      product_id: surplus.producto_id,
      product_code: surplus.productos?.codigo_item || 'N/A',
      product_name: surplus.productos?.nombre_item || 'Sin nombre',
      quantity: surplus.cantidad,
      date: surplus.fecha_sobrante,
      shipping_date: surplus.fecha_envio,
      destination: surplus.destino,
      shipping_status: surplus.estado_envio,
      observations: surplus.observaciones,
      user: surplus.usuario,
      surplus_reason: surplus.motivo_sobrante,
      tracking_code: surplus.codigo_tracking,
      responsible_user: surplus.usuario_responsable,
      delivery_date: surplus.fecha_entrega,
      created_at: surplus.created_at
    }
  }

  // Transformar alertas del backend al frontend
  _transformAlert(alert) {
    if (!alert) return null
    return {
      id: alert.id,
      product_id: alert.producto_id,
      codigo_producto: alert.productos?.codigo_item || alert.codigo_producto || 'N/A',
      nombre_producto: alert.productos?.nombre_item || alert.nombre_producto || 'Sin nombre',
      tipo_alerta: alert.tipo_alerta,
      descripcion: alert.descripcion,
      fecha_alerta: alert.fecha_alerta,
      estado_alerta: alert.estado_alerta,
      nivel_prioridad: alert.nivel_prioridad,
      productos: alert.productos, // Mantener relación con producto
      created_at: alert.created_at
    }
  }

  // Transformar del frontend al backend
  _transformProductToBackend(product) {
    if (!product) return null
    
    // FIX DEFINITIVO: Enviar SOLO la fecha en formato YYYY-MM-DD sin hora
    // El backend tiene problemas con ISO timestamps, así que enviamos fecha pura
    let fechaVencimiento = product.expiry_date
    if (fechaVencimiento) {
      // Si la fecha ya viene con timestamp (ISO), extraer solo la parte de fecha
      let fechaSoloString = fechaVencimiento
      if (fechaVencimiento.includes('T')) {
        fechaSoloString = fechaVencimiento.split('T')[0]
      }
      
      // Parsear componentes de fecha de forma segura
      const [year, month, day] = fechaSoloString.split('-').map(part => parseInt(part, 10))
      
      // Validar y formatear la fecha correctamente en formato YYYY-MM-DD
      if (year && month && day) {
        // Asegurar que mes y día tengan 2 dígitos con padding de ceros
        const monthStr = String(month).padStart(2, '0')
        const dayStr = String(day).padStart(2, '0')
        fechaVencimiento = `${year}-${monthStr}-${dayStr}`
        
        console.log('🔧 [FIX FECHA] Conversión de fecha:')
        console.log('   📥 Fecha recibida:', product.expiry_date)
        console.log('   📅 Componentes parseados:', { year, month, day })
        console.log('   📤 Fecha FINAL a enviar:', fechaVencimiento)
        console.log('   ✅ Formato: YYYY-MM-DD (SIN hora)')
      } else {
        console.warn('⚠️ [FIX FECHA] No se pudo parsear la fecha:', product.expiry_date)
      }
    }
    
    const backendProduct = {
      codigo_item: product.code,
      nombre_item: product.name,
      nombre_marca: product.brand || '',
      orden_compra: product.purchase_order || '',
      nombre_medida: product.unit,
      mayor: product.mayor ? Number(product.mayor) : 0,
      sub_cta: product.sub_account || '',
      stock_actual: Number(product.quantity),
      fecha_vencimiento: fechaVencimiento
    }
    
    console.log('[API] 📦 Producto transformado completo:', backendProduct)
    return backendProduct
  }

  // Transformar movimientos del frontend al backend
  _transformMovementToBackend(movement) {
    if (!movement) return null
    
    console.log('[API] Datos originales del movimiento:', movement)
    
    // Estructura base - IGUAL para entradas y salidas
    const backendMovement = {
      producto_id: Number(movement.product_id),
      cantidad: Number(movement.quantity),
      usuario: 'admin', // Campo requerido
      observaciones: movement.reason && movement.reason.trim() !== '' ? movement.reason.trim() : '' // Siempre incluir
    }
    
    // NOTA: fecha_movimiento NO se envía - el backend lo maneja automáticamente
    // El error era: "fecha_movimiento" is not allowed
    
    console.log('[API] Movimiento transformado final:', JSON.stringify(backendMovement, null, 2))
    console.log('[API] Tipo:', movement.type)
    console.log('[API] Campos enviados:', Object.keys(backendMovement))
    
    return backendMovement
  }

  async get(endpoint) {
    try {
      const response = await this.client.get(endpoint)
      
      // La API devuelve { success, data, timestamp, message, meta }
      // Necesitamos extraer el array que está en .data
      let responseData;
      if (response.data?.data !== undefined) {
        responseData = response.data.data
      } else if (Array.isArray(response.data)) {
        responseData = response.data
      } else {
        responseData = response.data
      }

      // Transformar productos si el endpoint es /products
      if (endpoint.includes('/products') && Array.isArray(responseData)) {
        responseData = responseData.map(p => this._transformProduct(p))
      }
      
      // Transformar movimientos si el endpoint es /movements
      if (endpoint.includes('/movements') && Array.isArray(responseData)) {
        responseData = responseData.map(m => this._transformMovement(m))
      }
      
      // Transformar bajas si el endpoint es /withdrawals
      if (endpoint.includes('/withdrawals') && Array.isArray(responseData)) {
        responseData = responseData.map(b => this._transformWithdrawal(b))
      }
      
      // Transformar sobrantes si el endpoint es /surplus
      if (endpoint.includes('/surplus') && Array.isArray(responseData)) {
        responseData = responseData.map(s => this._transformSurplus(s))
      }
      
      // Transformar alertas si el endpoint es /alerts
      if (endpoint.includes('/alerts') && Array.isArray(responseData)) {
        responseData = responseData.map(a => this._transformAlert(a))
      }
      
      return { success: true, data: responseData }
    } catch (error) {
      return this._handleError(error)
    }
  }

  async post(endpoint, data) {
    let requestData = data // Declarar fuera del try
    try {
      console.log('[API] POST Request:', { endpoint, originalData: data })
      
      // Transformar datos de producto antes de enviar
      if (endpoint.includes('/products') && data) {
        requestData = this._transformProductToBackend(data)
        console.log('[API] Datos transformados para backend:', requestData)
      }
      
      // Transformar datos de movimiento antes de enviar
      if (endpoint.includes('/movements') && data) {
        requestData = this._transformMovementToBackend(data)
        console.log('[API] Movimiento transformado para backend:', requestData)
      }
      
      console.log('[API] Enviando al servidor:', { endpoint, requestData })
      
      const response = await this.client.post(endpoint, requestData)
      let responseData = response.data?.data || response.data
      
      console.log('[API] Respuesta recibida:', responseData)
      
      // Transformar respuesta si es un producto
      if (endpoint.includes('/products') && responseData && !Array.isArray(responseData)) {
        responseData = this._transformProduct(responseData)
      }
      
      // Transformar respuesta si es un movimiento
      if (endpoint.includes('/movements') && responseData && !Array.isArray(responseData)) {
        responseData = this._transformMovement(responseData)
      }
      
      return { success: true, data: responseData }
    } catch (error) {
      console.error('[API] POST Error completo:', {
        endpoint,
        requestData,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        errorMessage: error.message
      })
      return this._handleError(error)
    }
  }

  async put(endpoint, data) {
    let requestData = data // Declarar fuera del try
    try {
      // Transformar datos de producto antes de enviar
      if (endpoint.includes('/products') && data) {
        requestData = this._transformProductToBackend(data)
      }
      
      const response = await this.client.put(endpoint, requestData)
      let responseData = response.data?.data || response.data
      
      // Transformar respuesta si es un producto
      if (endpoint.includes('/products') && responseData && !Array.isArray(responseData)) {
        responseData = this._transformProduct(responseData)
      }
      
      return { success: true, data: responseData }
    } catch (error) {
      return this._handleError(error)
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint)
      const responseData = response.data?.data || response.data
      return { success: true, data: responseData }
    } catch (error) {
      return this._handleError(error)
    }
  }

  _handleError(error) {
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Error desconocido'
    
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status || 500
    }
  }
}

// Singleton instance
const api = new ApiResponse()

export default api
