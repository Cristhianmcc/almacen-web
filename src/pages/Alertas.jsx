import { useApi } from '../hooks/useApi'
import './Alertas.css'

function Alertas() {
  // Cambiar de /products a /alerts para usar el sistema de alertas del backend
  const { data: alertas, loading } = useApi('/alerts')

  // Asegurar que alertas sea un array
  const alertasArray = Array.isArray(alertas) ? alertas : []

  const getNivelBadgeClass = (nivel) => {
    const nivelLower = nivel?.toLowerCase() || 'media'
    if (nivelLower === 'alta') return 'badge-danger'
    if (nivelLower === 'media') return 'badge-warning'
    return 'badge-info'
  }

  return (
    <div className="alertas-page">
      <div className="page-header">
        <h1>Alertas de Inventario</h1>
        <div className="alert-summary">
          <span className="alert-count">{alertasArray.length}</span>
          <span className="alert-label">alertas cargadas</span>
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
                <th>Código producto</th>
                <th>Nombre producto</th>
                <th>Tipo alerta</th>
                <th>Descripción</th>
                <th>Fecha alerta</th>
                <th>Estado alerta</th>
                <th>Nivel prioridad</th>
              </tr>
            </thead>
            <tbody>
              {alertasArray.map(alerta => {
                const producto = alerta.productos || {}
                return (
                  <tr key={alerta.id}>
                    <td>{producto.codigo_item || alerta.codigo_producto || 'N/A'}</td>
                    <td className="product-name">
                      {producto.nombre_item || alerta.nombre_producto || 'Sin nombre'}
                    </td>
                    <td>{alerta.tipo_alerta || 'N/A'}</td>
                    <td className="descripcion">{alerta.descripcion || 'Sin descripción'}</td>
                    <td>
                      {alerta.fecha_alerta 
                        ? new Date(alerta.fecha_alerta).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </td>
                    <td>
                      <span className="badge badge-secondary">
                        {alerta.estado_alerta || 'pendiente'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getNivelBadgeClass(alerta.nivel_prioridad)}`}>
                        {alerta.nivel_prioridad || 'media'}
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
