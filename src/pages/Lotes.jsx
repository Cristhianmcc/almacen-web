import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { FEFOService, LoteFEFO } from '../utils/fefo'
import './Lotes.css'

function Lotes() {
  const { data: productos } = useApi('/products')
  // const { data: lotes, loading, refetch } = useApi('/batches')
  // Temporalmente deshabilitado hasta confirmar endpoint
  const lotes = []
  const loading = false
  const refetch = () => {}
  
  const [productoSeleccionado, setProductoSeleccionado] = useState('')

  // Asegurar que sean arrays
  const productosArray = Array.isArray(productos) ? productos : []
  const lotesArray = Array.isArray(lotes) ? lotes : []

  const lotesFiltrados = productoSeleccionado
    ? lotesArray.filter(l => l.product_id === parseInt(productoSeleccionado))
    : lotesArray

  const calcularEstadisticas = () => {
    if (lotesArray.length === 0) return null

    const lotesObjetos = lotesArray.map(l => 
      new LoteFEFO(l.id, l.expiry_date, l.quantity, l.created_at)
    )

    return FEFOService.obtenerResumenLotes(lotesObjetos)
  }

  const obtenerAlertas = () => {
    if (lotesArray.length === 0) return []

    const lotesObjetos = lotesArray.map(l => 
      new LoteFEFO(l.id, l.expiry_date, l.quantity, l.created_at)
    )

    return FEFOService.verificarVencimientos(lotesObjetos, 30)
  }

  const estadisticas = calcularEstadisticas()
  const alertas = obtenerAlertas()

  return (
    <div className="lotes-page">
      <h1>Gestión de Lotes FEFO</h1>

      {estadisticas && (
        <div className="lotes-stats">
          <div className="stat-card">
            <h3>Total Lotes</h3>
            <p className="stat-value">{estadisticas.totalLotes}</p>
          </div>
          <div className="stat-card">
            <h3>Lotes Activos</h3>
            <p className="stat-value">{estadisticas.lotesActivos}</p>
          </div>
          <div className="stat-card">
            <h3>Lotes Vencidos</h3>
            <p className="stat-value danger">{estadisticas.lotesVencidos}</p>
          </div>
          <div className="stat-card">
            <h3>Próximos a Vencer</h3>
            <p className="stat-value warning">{estadisticas.lotesProximosVencer}</p>
          </div>
        </div>
      )}

      {alertas.length > 0 && (
        <div className="alertas-lotes">
          <h2>⚠️ Alertas de Vencimiento</h2>
          <div className="alertas-list">
            {alertas.map((alerta, i) => (
              <div key={i} className={`alerta-lote alerta-${alerta.prioridad.toLowerCase()}`}>
                <span className="alerta-tipo">{alerta.tipo === 'VENCIDO' ? '🔴' : '🟡'}</span>
                <span className="alerta-mensaje">{alerta.mensaje}</span>
                <span className="alerta-cantidad">Cantidad: {alerta.cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="lotes-header">
          <h2>Lotes Registrados</h2>
          <div className="form-group" style={{ maxWidth: '300px', marginBottom: 0 }}>
            <select
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
            >
              <option value="">Todos los productos</option>
              {productosArray.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando lotes...</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Lote ID</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Fecha Ingreso</th>
                  <th>Fecha Vencimiento</th>
                  <th>Días para Vencer</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {lotesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No hay lotes registrados
                    </td>
                  </tr>
                ) : (
                  lotesFiltrados.map((lote) => {
                    const loteObj = new LoteFEFO(lote.id, lote.expiry_date, lote.quantity, lote.created_at)
                    const diasRestantes = loteObj.diasParaVencer()
                    const estaVencido = loteObj.estaVencido()

                    return (
                      <tr key={lote.id} className={estaVencido ? 'lote-vencido' : ''}>
                        <td>{lote.batch_code}</td>
                        <td>{lote.product_name}</td>
                        <td>{lote.quantity}</td>
                        <td>{new Date(lote.created_at).toLocaleDateString()}</td>
                        <td>{new Date(lote.expiry_date).toLocaleDateString()}</td>
                        <td className={diasRestantes <= 7 ? 'dias-critico' : diasRestantes <= 30 ? 'dias-warning' : ''}>
                          {estaVencido ? 'VENCIDO' : `${diasRestantes} días`}
                        </td>
                        <td>
                          <span className={`badge badge-${estaVencido ? 'danger' : diasRestantes <= 30 ? 'warning' : 'success'}`}>
                            {estaVencido ? '❌ Vencido' : diasRestantes <= 30 ? '⚠️ Por vencer' : '✅ Activo'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Lotes
