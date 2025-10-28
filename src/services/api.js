import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://almacen-instituto.onrender.com/api'

class ApiResponse {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
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

  // Transformar del frontend al backend
  _transformProductToBackend(product) {
    if (!product) return null
    return {
      codigo_item: product.code,
      nombre_item: product.name,
      nombre_marca: product.brand,
      orden_compra: product.purchase_order || '',
      nombre_medida: product.unit,
      mayor: product.mayor || 0, // Precio mayorista (no confundir con min_stock)
      sub_cta: product.sub_account,
      stock_actual: product.quantity,
      // stock_minimo: product.min_stock, // TODO: Agregar cuando exista en el backend
      fecha_ingreso: product.entry_date,
      fecha_vencimiento: product.expiry_date,
      estado: product.status || 'activo'
    }
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
      
      return { success: true, data: responseData }
    } catch (error) {
      return this._handleError(error)
    }
  }

  async post(endpoint, data) {
    try {
      // Transformar datos de producto antes de enviar
      let requestData = data
      if (endpoint.includes('/products') && data) {
        requestData = this._transformProductToBackend(data)
      }
      
      const response = await this.client.post(endpoint, requestData)
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

  async put(endpoint, data) {
    try {
      // Transformar datos de producto antes de enviar
      let requestData = data
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
