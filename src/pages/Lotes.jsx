import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { FEFOService, LoteFEFO } from '../utils/fefo'
import './Lotes.css'

function Lotes() {
  const { data: productos, loading } = useApi('/products')
  const { data: movimientos } = useApi('/movements')
  
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [modalHistorial, setModalHistorial] = useState(false)
  const [loteSeleccionado, setLoteSeleccionado] = useState(null)

  // Asegurar que sean arrays
  const productosArray = Array.isArray(productos) ? productos : []
  
  // En este sistema, cada producto con fecha de vencimiento ES un lote
  // No hay tabla separada de lotes
  const lotes = productosArray
    .filter(p => p.expiry_date && p.quantity > 0) // Solo productos con fecha de vencimiento y stock
    .map(p => ({
      id: p.id,
      product_id: p.id,
      product_name: p.name,
      product_code: p.code,
      quantity: p.quantity,
      expiry_date: p.expiry_date,
      entry_date: p.entry_date,
      created_at: p.created_at || p.entry_date
    }))

  const lotesArray = lotes

  const lotesFiltrados = productoSeleccionado
    ? lotesArray.filter(l => l.product_id === parseInt(productoSeleccionado))
    : lotesArray

  const calcularEstadisticas = () => {
    if (lotesArray.length === 0) return null

    const lotesObjetos = lotesArray.map(l => 
      new LoteFEFO(l.id, l.expiry_date, l.quantity, l.created_at)
    )

    // Debug: Ver días para vencer de cada lote
    console.log('=== DEBUG LOTES ===')
    lotesObjetos.forEach(l => {
      const dias = l.diasParaVencer()
      const estado = l.estaVencido() ? '❌ VENCIDO' : dias <= 30 ? '⚠️ PROXIMO' : '✅ ACTIVO'
      console.log(`Lote ${l.loteId}: ${dias} días - ${estado}`)
    })

    const resumen = FEFOService.obtenerResumenLotes(lotesObjetos)
    console.log('Resumen:', resumen)
    
    return resumen
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

  const abrirHistorial = (lote) => {
    setLoteSeleccionado(lote)
    setModalHistorial(true)
  }

  const cerrarHistorial = () => {
    setModalHistorial(false)
    setLoteSeleccionado(null)
  }

  const obtenerHistorialLote = () => {
    if (!loteSeleccionado || !movimientos) return []
    
    const movimientosArray = Array.isArray(movimientos) ? movimientos : []
    
    // Filtrar movimientos del producto seleccionado
    return movimientosArray
      .filter(m => m.product_id === loteSeleccionado.product_id)
      .map(m => {
        // Construir las observaciones completas
        let observacionesCompletas = ''
        
        if (m.type === 'entrada') {
          observacionesCompletas = 'Entrada de lote - ' + (m.observations || m.reason || 'Entrada de producto')
        } else if (m.type === 'salida') {
          observacionesCompletas = 'Salida FEFO - ' + (m.observations || m.reason || 'Salida de producto')
        } else {
          // Otros tipos de movimiento
          observacionesCompletas = (m.observations || m.reason || 'Sin observaciones')
        }
        
        return {
          fecha: m.date || m.movement_date || m.created_at,
          cantidad: m.quantity,
          tipo: m.type,
          observaciones: observacionesCompletas
        }
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Más reciente primero
  }

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
              {productosArray
                .filter(p => p.expiry_date) // Solo productos con fecha de vencimiento
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.code ? `(${p.code})` : ''}
                  </option>
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lotesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No hay lotes registrados
                    </td>
                  </tr>
                ) : (
                  lotesFiltrados.map((lote) => {
                    const loteObj = new LoteFEFO(lote.id, lote.expiry_date, lote.quantity, lote.entry_date || lote.created_at)
                    const diasRestantes = loteObj.diasParaVencer()
                    const estaVencido = loteObj.estaVencido()

                    return (
                      <tr key={lote.id} className={estaVencido ? 'lote-vencido' : ''}>
                        <td>LOTE-{lote.id}</td>
                        <td>
                          <div>
                            <strong>{lote.product_name}</strong>
                            <br />
                            <small>Código: {lote.product_code}</small>
                          </div>
                        </td>
                        <td>{lote.quantity}</td>
                        <td>{lote.entry_date ? new Date(lote.entry_date).toLocaleDateString() : 'N/A'}</td>
                        <td>{new Date(lote.expiry_date).toLocaleDateString()}</td>
                        <td className={diasRestantes <= 7 ? 'dias-critico' : diasRestantes <= 30 ? 'dias-warning' : ''}>
                          {estaVencido ? 'VENCIDO' : `${diasRestantes} días`}
                        </td>
                        <td>
                          <span className={`badge badge-${estaVencido ? 'danger' : diasRestantes <= 30 ? 'warning' : 'success'}`}>
                            {estaVencido ? '❌ Vencido' : diasRestantes <= 30 ? '⚠️ Por vencer' : '✅ Activo'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => abrirHistorial(lote)}
                            className="btn-historial"
                            title="Ver historial de movimientos"
                          >
                            📊 Historial
                          </button>
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

      {/* Modal de historial */}
      {modalHistorial && loteSeleccionado && (
        <div className="modal-overlay" onClick={cerrarHistorial}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Historial FEFO - {loteSeleccionado.product_name}</h2>
              <button onClick={cerrarHistorial} className="modal-close">✕</button>
            </div>
            <div className="modal-body">
              <div className="historial-info">
                <p><strong>Código:</strong> {loteSeleccionado.product_code}</p>
                <p><strong>Lote ID:</strong> LOTE-{loteSeleccionado.id}</p>
                <p><strong>Stock actual:</strong> {loteSeleccionado.quantity} unidades</p>
              </div>
              
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Fecha Movimiento</th>
                    <th>Cantidad</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {obtenerHistorialLote().length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center">
                        No hay movimientos registrados para este lote
                      </td>
                    </tr>
                  ) : (
                    obtenerHistorialLote().map((mov, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(mov.fecha).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>{mov.cantidad}</td>
                        <td>{mov.observaciones}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button onClick={cerrarHistorial} className="btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Lotes
