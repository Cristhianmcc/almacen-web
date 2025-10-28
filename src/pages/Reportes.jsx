import { useState, useMemo } from 'react'
import { useApi } from '../hooks/useApi'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import './Reportes.css'

function Reportes() {
  const { data: productos } = useApi('/products')
  const { data: movimientos } = useApi('/movements')
  
  const productosArray = Array.isArray(productos) ? productos : []
  const movimientosArray = Array.isArray(movimientos) ? movimientos : []
  
  const [tipoReporte, setTipoReporte] = useState('inventario')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [filtrosAplicados, setFiltrosAplicados] = useState(false)

  const datosFiltrados = useMemo(() => {
    if (!filtrosAplicados || !fechaInicio || !fechaFin) {
      return tipoReporte === 'inventario' ? productosArray : movimientosArray
    }

    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    fin.setHours(23, 59, 59, 999)

    if (tipoReporte === 'inventario') {
      return productosArray.filter(p => {
        const fecha = new Date(p.entry_date || p.fecha_ingreso || p.created_at)
        return fecha >= inicio && fecha <= fin
      })
    } else {
      return movimientosArray.filter(m => {
        const fecha = new Date(m.date || m.fecha_movimiento || m.created_at)
        return fecha >= inicio && fecha <= fin
      })
    }
  }, [productosArray, movimientosArray, tipoReporte, fechaInicio, fechaFin, filtrosAplicados])

  const handleAplicarFiltros = () => {
    if (!fechaInicio || !fechaFin) {
      alert('⚠️ Por favor selecciona ambas fechas')
      return
    }
    setFiltrosAplicados(true)
  }

  const handleLimpiarFiltros = () => {
    setFechaInicio('')
    setFechaFin('')
    setFiltrosAplicados(false)
  }

  const exportarPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4')
      
      doc.setFontSize(18)
      doc.text(`Reporte de ${tipoReporte === 'inventario' ? 'Inventario' : 'Movimientos'}`, 14, 15)
      
      doc.setFontSize(10)
      if (filtrosAplicados && fechaInicio && fechaFin) {
        doc.text(`Período: ${fechaInicio} al ${fechaFin}`, 14, 22)
      }
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 28)
      
      if (tipoReporte === 'inventario') {
        const headers = [['Código', 'Nombre', 'Marca', 'Orden Compra', 'Medida', 'Mayor', 'Subcuenta', 'Stock', 'F. Ingreso', 'F. Vencimiento']]
        const data = datosFiltrados.map(p => [
          p.code || p.codigo_item || '',
          p.name || p.nombre_item || '',
          p.brand || p.nombre_marca || '',
          p.purchase_order || p.orden_compra || '',
          p.unit || p.nombre_medida || '',
          p.mayor || 0,
          p.sub_account || p.sub_cta || '',
          p.quantity || p.stock_actual || 0,
          p.entry_date ? new Date(p.entry_date).toLocaleDateString('es-ES') : '',
          p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('es-ES') : ''
        ])
        
        autoTable(doc, {
          head: headers,
          body: data,
          startY: 35,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [37, 99, 235], textColor: 255 },
          columnStyles: {
            7: { halign: 'center' },
            8: { halign: 'center' },
            9: { halign: 'center' }
          }
        })
      } else {
        const headers = [['Código Producto', 'Nombre', 'Tipo', 'Fecha', 'Cantidad', 'Stock anterior', 'Stock posterior']]
        const data = datosFiltrados.map(m => [
          m.product_code || m.productos?.codigo_item || '',
          m.product_name || m.productos?.nombre_item || '',
          m.type || m.tipo_movimiento || '',
          m.date ? new Date(m.date).toLocaleString('es-ES') : '',
          m.quantity || m.cantidad || 0,
          m.previous_stock || m.stock_anterior || 0,
          m.new_stock || m.stock_post_movimiento || m.stock_posterior || 0
        ])
        
        autoTable(doc, {
          head: headers,
          body: data,
          startY: 35,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          columnStyles: {
            3: { halign: 'center' },
            4: { halign: 'center' },
            5: { halign: 'center' },
            6: { halign: 'center' }
          }
        })
      }
      
      doc.save(`reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.pdf`)
      alert('✅ PDF exportado exitosamente')
    } catch (error) {
      console.error('Error al exportar PDF:', error)
      alert('❌ Error al exportar PDF: ' + error.message)
    }
  }

  const exportarExcel = () => {
    let datos, nombreHoja, nombreArchivo
    
    if (tipoReporte === 'inventario') {
      datos = datosFiltrados.map(p => ({
        'Código': p.code || p.codigo_item || '',
        'Nombre': p.name || p.nombre_item || '',
        'Marca': p.brand || p.nombre_marca || '',
        'Orden Compra': p.purchase_order || p.orden_compra || '',
        'Medida': p.unit || p.nombre_medida || '',
        'Mayor': p.mayor || 0,
        'Subcuenta': p.sub_account || p.sub_cta || '',
        'Stock': p.quantity || p.stock_actual || 0,
        'F. Ingreso': p.entry_date ? new Date(p.entry_date).toLocaleDateString('es-ES') : '',
        'F. Vencimiento': p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('es-ES') : ''
      }))
      nombreHoja = 'Inventario'
      nombreArchivo = 'reporte_inventario'
    } else {
      datos = datosFiltrados.map(m => ({
        'Código Producto': m.product_code || m.productos?.codigo_item || '',
        'Nombre': m.product_name || m.productos?.nombre_item || '',
        'Tipo': m.type || m.tipo_movimiento || '',
        'Fecha': m.date ? new Date(m.date).toLocaleString('es-ES') : '',
        'Cantidad': m.quantity || m.cantidad || 0,
        'Stock anterior': m.previous_stock || m.stock_anterior || 0,
        'Stock posterior': m.new_stock || m.stock_post_movimiento || m.stock_posterior || 0
      }))
      nombreHoja = 'Movimientos'
      nombreArchivo = 'reporte_movimientos'
    }
    
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(datos)
    
    const colWidths = Object.keys(datos[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }))
    ws['!cols'] = colWidths
    
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja)
    XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`)
    alert('✅ Excel exportado exitosamente')
  }

  const imprimir = () => {
    window.print()
  }

  return (
    <div className="reportes-page">
      <div className="reportes-header">
        <h1>Reportes</h1>
      </div>

      <div className="filtros-fecha">
        <h3>Filtros de Fecha</h3>
        <div className="filtros-controls">
          <div className="filtro-item">
            <label>Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="filtro-item">
            <label>Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="date-input"
            />
          </div>
          <button className="btn-aplicar" onClick={handleAplicarFiltros}>
            Aplicar Filtros
          </button>
          <button className="btn-limpiar" onClick={handleLimpiarFiltros}>
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="tipo-reporte-btns">
        <button 
          className={`btn-reporte ${tipoReporte === 'inventario' ? 'active' : ''}`}
          onClick={() => setTipoReporte('inventario')}
        >
          Reporte Inventario
        </button>
        <button 
          className={`btn-reporte ${tipoReporte === 'movimientos' ? 'active' : ''}`}
          onClick={() => setTipoReporte('movimientos')}
        >
          Reporte Movimientos
        </button>
      </div>

      <div className="exportacion-btns">
        <button className="btn-pdf" onClick={exportarPDF}>
          Exportar PDF
        </button>
        <button className="btn-excel" onClick={exportarExcel}>
          Exportar Excel
        </button>
        <button className="btn-imprimir" onClick={imprimir}>
          Imprimir
        </button>
      </div>

      <div className="tabla-reporte">
        {tipoReporte === 'inventario' ? (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Orden Compra</th>
                <th>Medida</th>
                <th>Mayor</th>
                <th>Subcuenta</th>
                <th>Stock</th>
                <th>F. Ingreso</th>
                <th>F. Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                    No hay datos para mostrar
                  </td>
                </tr>
              ) : (
                datosFiltrados.map((p, i) => (
                  <tr key={i}>
                    <td>{p.code || p.codigo_item}</td>
                    <td>{p.name || p.nombre_item}</td>
                    <td>{p.brand || p.nombre_marca}</td>
                    <td>{p.purchase_order || p.orden_compra}</td>
                    <td>{p.unit || p.nombre_medida}</td>
                    <td>{p.mayor || 0}</td>
                    <td>{p.sub_account || p.sub_cta}</td>
                    <td className="text-center">{p.quantity || p.stock_actual || 0}</td>
                    <td>{p.entry_date ? new Date(p.entry_date).toLocaleDateString('es-ES') : ''}</td>
                    <td>{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('es-ES') : ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código Producto</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Cantidad</th>
                <th>Stock anterior</th>
                <th>Stock posterior</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No hay datos para mostrar
                  </td>
                </tr>
              ) : (
                datosFiltrados.map((m, i) => (
                  <tr key={i}>
                    <td>{m.product_code || m.productos?.codigo_item}</td>
                    <td>{m.product_name || m.productos?.nombre_item}</td>
                    <td>
                      <span className={`tipo-badge ${m.type || m.tipo_movimiento}`}>
                        {m.type || m.tipo_movimiento}
                      </span>
                    </td>
                    <td>{m.date ? new Date(m.date).toLocaleString('es-ES') : ''}</td>
                    <td className="text-center">{m.quantity || m.cantidad}</td>
                    <td className="text-center">{m.previous_stock || m.stock_anterior}</td>
                    <td className="text-center">{m.new_stock || m.stock_post_movimiento || m.stock_posterior}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Reportes
