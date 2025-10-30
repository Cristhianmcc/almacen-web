import { useApi } from '../hooks/useApi'
import './Alertas.css'

function Alertas() {
  // Obtener productos y alertas del backend
  const { data: productos, loading: loadingProductos } = useApi('/products')
  const { data: alertasBackend, loading: loadingAlertas } = useApi('/alerts')

  // Generar alertas automáticas en tiempo real basadas en los productos
  const generarAlertasAutomaticas = () => {
    if (!productos || !Array.isArray(productos)) return []
    
    const alertasGeneradas = []
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0) // Normalizar a medianoche para comparaciones
    
    productos.forEach(producto => {
      // ALERTA 1: Stock bajo (menor a min_stock o menor a 30 si no está definido)
      const stockMinimo = producto.min_stock || 30
      const stockActual = producto.quantity ?? 0 // Usar 0 si es null/undefined
      
      if (stockActual < stockMinimo) {
        alertasGeneradas.push({
          id: `auto-stock-${producto.id}`,
          product_id: producto.id,
          codigo_producto: producto.code,
          nombre_producto: producto.name,
          tipo_alerta: 'bajo_stock',
          descripcion: `Stock bajo: ${stockActual} unidades restantes (mínimo: ${stockMinimo})`,
          fecha_alerta: new Date().toISOString(),
          estado_alerta: 'pendiente',
          nivel_prioridad: stockActual < stockMinimo * 0.5 ? 'alta' : 'media',
          stock_actual: stockActual, // Agregar directamente para fácil acceso
          productos: producto
        })
      }
      
      // ALERTA 2: Producto próximo a vencer (dentro de 30 días)
      if (producto.expiry_date) {
        const fechaVencimiento = new Date(producto.expiry_date)
        const diasParaVencer = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24))
        
        if (diasParaVencer <= 30 && diasParaVencer >= 0) {
          alertasGeneradas.push({
            id: `auto-venc-${producto.id}`,
            product_id: producto.id,
            codigo_producto: producto.code,
            nombre_producto: producto.name,
            tipo_alerta: 'proximo_vencimiento',
            descripcion: `Producto próximo a vencer: ${diasParaVencer} días restantes`,
            fecha_alerta: new Date().toISOString(),
            estado_alerta: 'pendiente',
            nivel_prioridad: diasParaVencer <= 7 ? 'alta' : diasParaVencer <= 15 ? 'media' : 'baja',
            stock_actual: stockActual, // Agregar stock actual
            fecha_vencimiento: producto.expiry_date, // Agregar fecha de vencimiento
            productos: producto
          })
        }
        
        // ALERTA 3: Producto ya vencido
        if (diasParaVencer < 0) {
          alertasGeneradas.push({
            id: `auto-vencido-${producto.id}`,
            product_id: producto.id,
            codigo_producto: producto.code,
            nombre_producto: producto.name,
            tipo_alerta: 'vencido',
            descripcion: `Producto VENCIDO hace ${Math.abs(diasParaVencer)} días`,
            fecha_alerta: new Date().toISOString(),
            estado_alerta: 'pendiente',
            nivel_prioridad: 'alta',
            stock_actual: stockActual, // Agregar stock actual
            fecha_vencimiento: producto.expiry_date, // Agregar fecha de vencimiento
            productos: producto
          })
        }
      }
      
      // ALERTA 4: Stock crítico + próximo a vencer (doble problema)
      if (stockActual < stockMinimo && producto.expiry_date) {
        const fechaVencimiento = new Date(producto.expiry_date)
        const diasParaVencer = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24))
        
        if (diasParaVencer <= 30 && diasParaVencer >= 0) {
          alertasGeneradas.push({
            id: `auto-critico-${producto.id}`,
            product_id: producto.id,
            codigo_producto: producto.code,
            nombre_producto: producto.name,
            tipo_alerta: 'critico',
            descripcion: `CRÍTICO: Stock bajo (${stockActual} unid.) Y vence en ${diasParaVencer} días`,
            fecha_alerta: new Date().toISOString(),
            estado_alerta: 'pendiente',
            nivel_prioridad: 'alta',
            stock_actual: stockActual, // Agregar stock actual
            fecha_vencimiento: producto.expiry_date, // Agregar fecha de vencimiento
            productos: producto
          })
        }
      }
    })
    
    return alertasGeneradas
  }

  // Combinar alertas del backend con alertas generadas automáticamente
  const alertasAutomaticas = generarAlertasAutomaticas()
  const alertasBackendArray = Array.isArray(alertasBackend) ? alertasBackend : []
  
  // DEBUG: Mostrar estructura de datos
  if (alertasAutomaticas.length > 0) {
    console.log('🔍 [DEBUG] Ejemplo de alerta generada:', alertasAutomaticas[0])
    console.log('🔍 [DEBUG] Estructura producto:', alertasAutomaticas[0]?.productos)
  }
  
  // Unificar todas las alertas (eliminar duplicados basados en producto_id y tipo)
  const alertasUnicas = new Map()
  
  // Agregar alertas del backend primero
  alertasBackendArray.forEach(alerta => {
    const key = `${alerta.product_id}-${alerta.tipo_alerta}`
    alertasUnicas.set(key, alerta)
  })
  
  // PRIORIZAR alertas automáticas (son más recientes y tienen datos actualizados)
  // Esto sobrescribirá las alertas del backend si existen
  alertasAutomaticas.forEach(alerta => {
    const key = `${alerta.product_id}-${alerta.tipo_alerta}`
    alertasUnicas.set(key, alerta) // Sobrescribir siempre con datos actuales
  })
  
  const alertasArray = Array.from(alertasUnicas.values())
    .sort((a, b) => {
      // Ordenar por prioridad: alta > media > baja
      const prioridades = { alta: 3, media: 2, baja: 1 }
      const prioridadA = prioridades[a.nivel_prioridad?.toLowerCase()] || 1
      const prioridadB = prioridades[b.nivel_prioridad?.toLowerCase()] || 1
      return prioridadB - prioridadA
    })

  const loading = loadingProductos || loadingAlertas

  const getNivelBadgeClass = (nivel) => {
    const nivelLower = nivel?.toLowerCase() || 'media'
    if (nivelLower === 'alta') return 'badge-danger'
    if (nivelLower === 'media') return 'badge-warning'
    return 'badge-info'
  }

  // Calcular estadísticas de alertas
  const estadisticas = {
    total: alertasArray.length,
    alta: alertasArray.filter(a => a.nivel_prioridad?.toLowerCase() === 'alta').length,
    media: alertasArray.filter(a => a.nivel_prioridad?.toLowerCase() === 'media').length,
    baja: alertasArray.filter(a => a.nivel_prioridad?.toLowerCase() === 'baja').length,
    bajo_stock: alertasArray.filter(a => a.tipo_alerta === 'bajo_stock').length,
    vencimiento: alertasArray.filter(a => a.tipo_alerta === 'proximo_vencimiento').length,
    vencidos: alertasArray.filter(a => a.tipo_alerta === 'vencido').length,
    criticos: alertasArray.filter(a => a.tipo_alerta === 'critico').length
  }

  return (
    <div className="alertas-page">
      <h1>⚠️ Alertas de Inventario (Tiempo Real)</h1>
      
      <div className="alert-summary-card">
        <span className="alert-count">{estadisticas.total}</span>
        <span className="alert-label">alertas en total</span>
      </div>

      {/* Panel de estadísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          background: '#fee2e2', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '2px solid #dc2626' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {estadisticas.alta}
          </div>
          <div style={{ fontSize: '14px', color: '#7f1d1d' }}>Prioridad Alta</div>
        </div>
        
        <div style={{ 
          background: '#fef3c7', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '2px solid #f59e0b' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {estadisticas.media}
          </div>
          <div style={{ fontSize: '14px', color: '#92400e' }}>Prioridad Media</div>
        </div>
        
        <div style={{ 
          background: '#dbeafe', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '2px solid #3b82f6' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
            {estadisticas.baja}
          </div>
          <div style={{ fontSize: '14px', color: '#1e3a8a' }}>Prioridad Baja</div>
        </div>
        
        <div style={{ 
          background: '#f3e8ff', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '2px solid #a855f7' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a855f7' }}>
            {estadisticas.bajo_stock}
          </div>
          <div style={{ fontSize: '14px', color: '#581c87' }}>Stock Bajo</div>
        </div>
        
        <div style={{ 
          background: '#fed7aa', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '2px solid #ea580c' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>
            {estadisticas.vencimiento}
          </div>
          <div style={{ fontSize: '14px', color: '#7c2d12' }}>Próx. Vencer</div>
        </div>
        
        <div style={{ 
          background: '#fecaca', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '2px solid #991b1b' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b' }}>
            {estadisticas.vencidos}
          </div>
          <div style={{ fontSize: '14px', color: '#7f1d1d' }}>Vencidos</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando alertas...</p>
        </div>
      ) : alertasArray.length === 0 ? (
        <div className="alert alert-success">
          ✅ No hay alertas pendientes. Todo está en orden.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Tipo Alerta</th>
                <th>Descripción</th>
                <th>Stock Actual</th>
                <th>F. Vencimiento</th>
                <th>Fecha Alerta</th>
                <th>Prioridad</th>
              </tr>
            </thead>
            <tbody>
              {alertasArray.map(alerta => {
                // Obtener el producto - puede venir de diferentes fuentes
                const producto = alerta.productos || {}
                
                // Obtener stock actual - intentar todas las posibles ubicaciones
                const stockActual = producto.quantity || producto.stock_actual || alerta.stock_actual || 'N/A'
                
                // Obtener fecha de vencimiento
                const fechaVenc = producto.expiry_date || producto.fecha_vencimiento || alerta.fecha_vencimiento || null
                
                // Obtener el tipo de alerta con icono
                const getTipoAlertaDisplay = (tipo) => {
                  const tipos = {
                    'bajo_stock': '📦 Stock Bajo',
                    'proximo_vencimiento': '⏰ Próx. Vencer',
                    'vencido': '❌ VENCIDO',
                    'critico': '🚨 CRÍTICO',
                  }
                  return tipos[tipo] || tipo || 'N/A'
                }
                
                return (
                  <tr key={alerta.id} style={{
                    backgroundColor: alerta.tipo_alerta === 'vencido' ? '#fee2e2' : 
                                    alerta.tipo_alerta === 'critico' ? '#fef3c7' : 'white'
                  }}>
                    <td><strong>{alerta.codigo_producto || 'N/A'}</strong></td>
                    <td className="product-name">
                      {alerta.nombre_producto || 'Sin nombre'}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: alerta.tipo_alerta === 'vencido' ? '#dc2626' :
                                  alerta.tipo_alerta === 'critico' ? '#f59e0b' :
                                  alerta.tipo_alerta === 'bajo_stock' ? '#a855f7' : '#3b82f6',
                        color: 'white'
                      }}>
                        {getTipoAlertaDisplay(alerta.tipo_alerta)}
                      </span>
                    </td>
                    <td className="descripcion">{alerta.descripcion || 'Sin descripción'}</td>
                    <td style={{
                      fontWeight: 'bold',
                      color: stockActual !== 'N/A' && stockActual < 20 ? '#dc2626' : '#059669'
                    }}>
                      {stockActual}
                    </td>
                    <td>
                      {fechaVenc
                        ? new Date(fechaVenc).toLocaleDateString('es-ES')
                        : 'N/A'}
                    </td>
                    <td>
                      {alerta.fecha_alerta 
                        ? new Date(alerta.fecha_alerta).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </td>
                    <td>
                      <span className={`badge ${getNivelBadgeClass(alerta.nivel_prioridad)}`}>
                        {alerta.nivel_prioridad?.toUpperCase() || 'MEDIA'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Alertas
