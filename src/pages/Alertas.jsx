import { useApi } from '../hooks/useApi'
import './Alertas.css'

function Alertas() {
  const { data: productos, loading } = useApi('/products')

  // Asegurar que productos sea un array
  const productosArray = Array.isArray(productos) ? productos : []
  const alertas = productosArray.filter(p => (p?.quantity || 0) <= (p?.min_stock || 0))

  const getAlertLevel = (producto) => {
    const quantity = producto?.quantity || 0
    const minStock = producto?.min_stock || 1
    const porcentaje = (quantity / minStock) * 100
    if (porcentaje === 0) return 'critico'
    if (porcentaje <= 50) return 'alto'
    return 'medio'
  }

  return (
    <div className="alertas-page">
      <div className="page-header">
        <h1>Alertas de Stock</h1>
        <div className="alert-summary">
          <span className="alert-count">{alertas.length}</span>
          <span className="alert-label">productos con stock bajo</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando alertas...</p>
        </div>
      ) : alertas.length === 0 ? (
        <div className="alert alert-success">
          ✅ No hay productos con stock bajo. Todo está en orden.
        </div>
      ) : (
        <div className="alertas-grid">
          {alertas.map(producto => {
            const level = getAlertLevel(producto)
            return (
              <div key={producto.id || producto._id} className={`alerta-card alerta-${level}`}>
                <div className="alerta-header">
                  <span className="alerta-icon">
                    {level === 'critico' ? '🔴' : level === 'alto' ? '🟠' : '🟡'}
                  </span>
                  <h3>{producto.name || 'Sin nombre'}</h3>
                </div>
                
                <div className="alerta-body">
                  <div className="alerta-stat">
                    <span className="stat-label">Stock Actual</span>
                    <span className="stat-value">{producto.quantity || 0}</span>
                  </div>
                  
                  <div className="alerta-stat">
                    <span className="stat-label">Stock Mínimo</span>
                    <span className="stat-value">{producto.min_stock || 0}</span>
                  </div>
                  
                  <div className="alerta-stat">
                    <span className="stat-label">Unidad</span>
                    <span className="stat-value">{producto.unit || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="alerta-footer">
                  <span className={`nivel-badge nivel-${level}`}>
                    {level === 'critico' ? 'CRÍTICO' : level === 'alto' ? 'ALTO' : 'MEDIO'}
                  </span>
                  {producto.code && (
                    <span className="producto-code">Código: {producto.code}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Alertas
