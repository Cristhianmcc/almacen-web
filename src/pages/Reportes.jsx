import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import api from '../services/api'
import './Reportes.css'

function Reportes() {
  const { data: productos } = useApi('/products')
  const { data: movimientos } = useApi('/movements')
  // const { data: bajas } = useApi('/wastage')
  // const { data: sobrantes } = useApi('/surplus')
  
  // Asegurar que todos sean arrays
  const productosArray = Array.isArray(productos) ? productos : []
  const movimientosArray = Array.isArray(movimientos) ? movimientos : []
  const bajasArray = [] // Array.isArray(bajas) ? bajas : []
  const sobrantesArray = [] // Array.isArray(sobrantes) ? sobrantes : []
  
  const [tipoReporte, setTipoReporte] = useState('general')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  const reportes = {
    general: {
      titulo: 'Reporte General',
      descripcion: 'Vista general del sistema de inventario',
      datos: [
        { label: 'Total Productos', valor: productosArray.length },
        { label: 'Total Movimientos', valor: movimientosArray.length },
        { label: 'Total Bajas', valor: bajasArray.length },
        { label: 'Total Sobrantes', valor: sobrantesArray.length },
        { label: 'Productos con Stock Bajo', valor: productosArray.filter(p => (p?.quantity || 0) <= (p?.min_stock || 0)).length }
      ]
    },
    stock: {
      titulo: 'Reporte de Stock',
      descripcion: 'Estado actual del inventario',
      datos: productosArray.map(p => ({
        producto: p.name || 'Sin nombre',
        cantidad: p.quantity || 0,
        minimo: p.min_stock || 0,
        estado: (p?.quantity || 0) <= (p?.min_stock || 0) ? '⚠️ Bajo' : '✅ OK'
      }))
    },
    movimientos: {
      titulo: 'Reporte de Movimientos',
      descripcion: 'Historial de entradas y salidas',
      datos: movimientosArray.map(m => ({
        fecha: new Date(m.created_at).toLocaleDateString(),
        tipo: m.type || 'N/A',
        producto: m.product_name || 'Sin nombre',
        cantidad: m.quantity || 0
      }))
    },
    bajas: {
      titulo: 'Reporte de Bajas',
      descripcion: 'Productos dados de baja',
      datos: bajasArray.map(b => ({
        fecha: new Date(b.created_at).toLocaleDateString(),
        producto: b.product_name || 'Sin nombre',
        cantidad: b.quantity || 0,
        motivo: b.reason || 'Sin motivo'
      }))
    }
  }

  const reporteActual = reportes[tipoReporte]

  const handleExportar = async () => {
    try {
      const response = await api.get(`/reports/${tipoReporte}?start=${fechaInicio}&end=${fechaFin}`)
      if (response.success) {
        const dataStr = JSON.stringify(response.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `reporte_${tipoReporte}_${new Date().toISOString()}.json`
        link.click()
      }
    } catch (error) {
      console.error('Error al exportar:', error)
    }
  }

  return (
    <div className="reportes-page">
      <h1>Reportes</h1>

      <div className="reportes-layout">
        <div className="reportes-controls">
          <h2>Configuración</h2>
          
          <div className="form-group">
            <label>Tipo de Reporte</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
            >
              <option value="general">General</option>
              <option value="stock">Stock</option>
              <option value="movimientos">Movimientos</option>
              <option value="bajas">Bajas</option>
            </select>
          </div>

          <div className="form-group">
            <label>Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <button className="btn-export" onClick={handleExportar}>
            📊 Exportar Reporte
          </button>
        </div>

        <div className="report-section">
          <h2>{reporteActual.titulo}</h2>
          <p>{reporteActual.descripcion}</p>

          {tipoReporte === 'general' ? (
            <div className="report-content">
              {reporteActual.datos.map((dato, i) => (
                <p key={i}>
                  <strong>{dato.label}:</strong> {dato.valor}
                </p>
              ))}
            </div>
          ) : (
            <div className="report-table">
              <table>
                <thead>
                  <tr>
                    {Object.keys(reporteActual.datos[0] || {}).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reporteActual.datos.map((fila, i) => (
                    <tr key={i}>
                      {Object.values(fila).map((valor, j) => (
                        <td key={j}>{valor}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reportes
