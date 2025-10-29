import { useApi } from '../hooks/useApi'
import './Dashboard.css'

function Dashboard() {
  const { data: productos, loading: loadingProductos } = useApi('/products')
  const { data: movimientos, loading: loadingMovimientos } = useApi('/movements')
  const { data: bajas, loading: loadingBajas } = useApi('/withdrawals')
  const { data: sobrantes, loading: loadingSobrantes } = useApi('/surplus')
  const { data: alertas, loading: loadingAlertas } = useApi('/alerts') // Nuevo: obtener alertas del backend

  // Asegurar que todos sean arrays
  const productosArray = Array.isArray(productos) ? productos : []
  const movimientosArray = Array.isArray(movimientos) ? movimientos : []
  const bajasArray = Array.isArray(bajas) ? bajas : []
  const sobrantesArray = Array.isArray(sobrantes) ? sobrantes : []
  const alertasArray = Array.isArray(alertas) ? alertas : [] // Nuevo

  const stats = [
    {
      title: 'Total Productos',
      value: productosArray.length,
      icon: '📦',
      color: 'primary',
      loading: loadingProductos
    },
    {
      title: 'Movimientos',
      value: movimientosArray.length,
      icon: '📋',
      color: 'info',
      loading: loadingMovimientos
    },
    {
      title: 'Bajas',
      value: bajasArray.length,
      icon: '❌',
      color: 'danger',
      loading: loadingBajas
    },
    {
      title: 'Sobrantes',
      value: sobrantesArray.length,
      icon: '➕',
      color: 'success',
      loading: loadingSobrantes
    },
    {
      title: 'Alertas',
      value: alertasArray.length, // Usar alertas del backend
      icon: '⚠️',
      color: 'warning',
      loading: loadingAlertas // Nuevo loading
    }
  ]

  return (
    <div className="dashboard">
      <h1>📊 Dashboard</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3 className="stat-title">{stat.title}</h3>
              {stat.loading ? (
                <div className="stat-loading">Cargando...</div>
              ) : (
                <p className="stat-value">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Alertas de Inventario</h2>
            <span className="badge-count">{alertasArray.length}</span>
          </div>
          {loadingAlertas ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <span>Cargando alertas...</span>
            </div>
          ) : (
            <div className="alert-list">
              {alertasArray
                .slice(0, 5)
                .map(alerta => {
                  const producto = alerta.productos || {}
                  const nivel = alerta.nivel_prioridad?.toLowerCase() || 'media'
                  const esCritico = nivel === 'alta'
                  return (
                    <div key={alerta.id} className="alert-item-modern">
                      <div className="alert-info">
                        <div className="alert-header-row">
                          <span className="product-name-alert">
                            {producto.nombre_item || alerta.nombre_producto || 'Sin nombre'}
                          </span>
                          <span className={`status-badge ${esCritico ? 'critical' : 'warning'}`}>
                            {alerta.tipo_alerta || 'Alerta'}
                          </span>
                        </div>
                        <div className="alert-details">
                          <span className="detail-item">
                            <span className="detail-label">Prioridad:</span>
                            <span className="detail-value">{alerta.nivel_prioridad || 'Media'}</span>
                          </span>
                          <span className="detail-separator">•</span>
                          <span className="detail-item">
                            <span className="detail-label">Estado:</span>
                            <span className="detail-value">{alerta.estado_alerta || 'Pendiente'}</span>
                          </span>
                        </div>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className={`progress-bar ${esCritico ? 'critical' : 'warning'}`}
                          style={{ width: esCritico ? '100%' : '70%' }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              {alertasArray.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">✓</span>
                  <p>No hay alertas pendientes</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Últimos Movimientos</h2>
            <span className="badge-count">{movimientosArray.length}</span>
          </div>
          {loadingMovimientos ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <span>Cargando movimientos...</span>
            </div>
          ) : (
            <div className="movement-list">
              {movimientosArray
                .slice(0, 5)
                .map(mov => (
                  <div key={mov.id} className="movement-item-modern">
                    <div className={`movement-icon ${mov.type}`}>
                      {mov.type === 'entrada' ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 2L8 14M8 2L4 6M8 2L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 14L8 2M8 14L12 10M8 14L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="movement-details">
                      <div className="movement-main">
                        <span className="movement-product">{mov.product_name}</span>
                        <span className={`movement-badge ${mov.type}`}>
                          {mov.type === 'entrada' ? 'Entrada' : 'Salida'}
                        </span>
                      </div>
                      <div className="movement-meta">
                        <span className="meta-item">
                          <span className="meta-label">Cantidad:</span>
                          <span className="meta-value">{mov.quantity}</span>
                        </span>
                        <span className="meta-separator">•</span>
                        <span className="meta-item">
                          <span className="meta-label">Stock:</span>
                          <span className="meta-value">{mov.new_stock}</span>
                        </span>
                        {mov.date && (
                          <>
                            <span className="meta-separator">•</span>
                            <span className="meta-item">
                              <span className="meta-value">
                                {new Date(mov.date).toLocaleDateString('es-ES', { 
                                  day: '2-digit', 
                                  month: 'short' 
                                })}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {movimientosArray.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <p>No hay movimientos registrados</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
