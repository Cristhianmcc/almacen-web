import { useState, useMemo } from 'react'
import { useApi } from '../hooks/useApi'
import api from '../services/api'
import './Sobrantes.css'

function Sobrantes() {
  const { data: sobrantes, loading, error, refetch } = useApi('/surplus')
  const { data: productos } = useApi('/products')
  
  // Estados para búsqueda y modal
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    producto_id: '',
    cantidad: '',
    observaciones: ''
  })

  // Asegurar que sea un array
  const sobrantesArray = Array.isArray(sobrantes) ? sobrantes : []
  const productosArray = Array.isArray(productos) ? productos : []

  // Filtrar sobrantes según búsqueda
  const sobrantesFiltrados = useMemo(() => {
    if (!searchTerm) return sobrantesArray
    
    const term = searchTerm.toLowerCase()
    return sobrantesArray.filter(sobrante => {
      // Buscar en código de producto
      const codigo = sobrante.productos?.codigo_item || sobrante.product_code || ''
      if (codigo.toLowerCase().includes(term)) return true
      
      // Buscar en nombre de producto
      const nombre = sobrante.productos?.nombre_item || sobrante.product_name || ''
      if (nombre.toLowerCase().includes(term)) return true
      
      // Buscar en destino
      const destino = sobrante.destino || sobrante.destination || ''
      if (destino.toLowerCase().includes(term)) return true
      
      // Buscar en estado de envío
      const estado = sobrante.estado_envio || sobrante.shipping_status || ''
      if (estado.toLowerCase().includes(term)) return true
      
      return false
    })
  }, [sobrantesArray, searchTerm])

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.producto_id || !formData.cantidad) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    setSubmitting(true)
    try {
      // Solo enviar los campos que el backend acepta
      const dataToSend = {
        producto_id: parseInt(formData.producto_id),
        cantidad: parseInt(formData.cantidad)
      }
      
      // Agregar observaciones solo si hay valor (si el backend lo acepta)
      if (formData.observaciones && formData.observaciones.trim()) {
        dataToSend.observaciones = formData.observaciones
      }
      
      await api.post('/surplus', dataToSend)
      
      // Resetear formulario y cerrar modal
      setFormData({
        producto_id: '',
        cantidad: '',
        observaciones: ''
      })
      setShowModal(false)
      
      // Recargar datos
      refetch()
      
      alert('✅ Sobrante registrado exitosamente')
    } catch (err) {
      console.error('Error al registrar sobrante:', err)
      alert('❌ Error al registrar el sobrante: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sobrantes-page">
      <h1>📦 Registro de Sobrantes</h1>
      
      {/* Barra de búsqueda y botón nuevo sobrante */}
      <div className="sobrantes-controls">
        <div className="search-box">
          <label htmlFor="search-sobrantes">Buscar:</label>
          <input
            id="search-sobrantes"
            type="text"
            placeholder="Buscar por código, producto o destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button 
            className="btn-search"
            onClick={() => setSearchTerm('')}
          >
            {searchTerm ? '✕ Limpiar' : '🔍 Buscar'}
          </button>
        </div>
        
        <button 
          className="btn-nuevo-sobrante"
          onClick={() => setShowModal(true)}
        >
          ➕ Nuevo Sobrante
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando sobrantes...</p>
        </div>
      ) : error ? (
        <div style={{ 
          background: '#fef2f2', 
          border: '2px solid #fecaca', 
          borderRadius: '12px', 
          padding: '2rem',
          margin: '2rem 0',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>⚠️ Error al cargar sobrantes</h3>
          <p style={{ color: '#6b7280' }}>
            {error.message || 'No se pudieron cargar los sobrantes'}
          </p>
        </div>
      ) : (
        <>
          {/* Contador de sobrantes */}
          <div className="sobrantes-counter">
            Sobrantes cargados: {sobrantesFiltrados.length}
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Codigo producto</th>
                  <th>Nombre producto</th>
                  <th>Cantidad</th>
                  <th>Fecha sobrante</th>
                  <th>Estado envio</th>
                </tr>
              </thead>
              <tbody>
                {sobrantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <div style={{ padding: '2rem' }}>
                        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
                          {searchTerm ? 'No se encontraron sobrantes con ese criterio' : 'No hay sobrantes registrados'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sobrantesFiltrados.map((sobrante) => (
                    <tr key={sobrante.id}>
                      <td>
                        <code style={{
                          background: '#f3f4f6',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {sobrante.productos?.codigo_item || sobrante.product_code || 'N/A'}
                        </code>
                      </td>
                      <td>
                        <strong>{sobrante.productos?.nombre_item || sobrante.product_name || 'Sin nombre'}</strong>
                      </td>
                      <td className="text-center">
                        <strong style={{ fontSize: '1.1rem' }}>
                          {sobrante.cantidad || sobrante.quantity || 0}
                        </strong>
                      </td>
                      <td>
                        {new Date(sobrante.fecha_sobrante || sobrante.date || sobrante.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="text-center">
                        <span style={{
                          background: sobrante.estado_envio === 'pendiente' ? '#fef3c7' : '#d1fae5',
                          color: sobrante.estado_envio === 'pendiente' ? '#d97706' : '#059669',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          textTransform: 'lowercase'
                        }}>
                          {sobrante.estado_envio || sobrante.shipping_status || 'pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {/* Modal para nuevo sobrante */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Sobrante de Inventario</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="producto_id">Buscar producto:</label>
                <select
                  id="producto_id"
                  name="producto_id"
                  value={formData.producto_id}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">Seleccionar producto...</option>
                  {productosArray.map(producto => (
                    <option key={producto.id} value={producto.id}>
                      {producto.code} - {producto.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="cantidad">Cantidad sobrante:</label>
                <input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder=""
                />
              </div>

              <div className="form-group">
                <label htmlFor="observaciones">Observaciones:</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder=""
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="submit" 
                  className="btn-guardar"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  type="button" 
                  className="btn-cancelar"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sobrantes
