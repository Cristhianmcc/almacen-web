import { useApi } from '../hooks/useApi'
import './Dashboard.css'

function Dashboard() {
  const { data: productos, loading: loadingProductos } = useApi('/products')
  const { data: movimientos, loading: loadingMovimientos } = useApi('/movements')
  // Temporalmente comentados hasta confirmar endpoints
  // const { data: bajas, loading: loadingBajas } = useApi('/wastage')
  // const { data: sobrantes, loading: loadingSobrantes } = useApi('/surplus')

  // Asegurar que todos sean arrays
  const productosArray = Array.isArray(productos) ? productos : []
  const movimientosArray = Array.isArray(movimientos) ? movimientos : []
  const bajasArray = [] // Array.isArray(bajas) ? bajas : []
  const sobrantesArray = [] // Array.isArray(sobrantes) ? sobrantes : []

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
      loading: false // loadingBajas
    },
    {
      title: 'Sobrantes',
      value: sobrantesArray.length,
      icon: '➕',
      color: 'success',
      loading: false // loadingSobrantes
    },
    {
      title: 'Alertas',
      value: productosArray.filter(p => (p?.quantity || 0) <= (p?.min_stock || 0)).length,
      icon: '⚠️',
      color: 'warning',
      loading: loadingProductos
    }
  ]

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
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
            <h2>Productos con Stock Bajo</h2>
            <span className="badge-count">
              {productosArray.filter(p => (p?.quantity || 0) <= (p?.min_stock || 0)).length}
            </span>
          </div>
          {loadingProductos ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <span>Cargando productos...</span>
            </div>
          ) : (
            <div className="alert-list">
              {productosArray
                .filter(p => (p?.quantity || 0) <= (p?.min_stock || 0))
                .slice(0, 5)
                .map(producto => {
                  const percentage = ((producto.quantity || 0) / (producto.min_stock || 1)) * 100
                  return (
                    <div key={producto.id} className="alert-item-modern">
                      <div className="alert-info">
                        <div className="alert-header-row">
                          <span className="product-name-alert">{producto.name}</span>
                          <span className={`status-badge ${percentage === 0 ? 'critical' : 'warning'}`}>
                            {percentage === 0 ? 'Agotado' : 'Bajo'}
                          </span>
                        </div>
                        <div className="alert-details">
                          <span className="detail-item">
                            <span className="detail-label">Stock:</span>
                            <span className="detail-value">{producto.quantity || 0}</span>
                          </span>
                          <span className="detail-separator">•</span>
                          <span className="detail-item">
                            <span className="detail-label">Mínimo:</span>
                            <span className="detail-value">{producto.min_stock || 0}</span>
                          </span>
                        </div>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className={`progress-bar ${percentage === 0 ? 'critical' : percentage <= 50 ? 'danger' : 'warning'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              {productosArray.filter(p => (p?.quantity || 0) <= (p?.min_stock || 0)).length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">✓</span>
                  <p>Todos los productos tienen stock adecuado</p>
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
