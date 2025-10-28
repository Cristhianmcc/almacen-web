import { useState, useMemo } from 'react'
import { useApi } from '../hooks/useApi'
import api from '../services/api'
import './Bajas.css'

function Bajas() {
  // El endpoint de bajas es /withdrawals en el backend
  const { data: bajas, loading, error, refetch } = useApi('/withdrawals')
  const { data: productos } = useApi('/products')
  
  // Estados para búsqueda y modal
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    producto_id: '',
    motivo_baja: '',
    cantidad_baja: '',
    observaciones: ''
  })

  // Asegurar que bajas sea un array
  const bajasArray = Array.isArray(bajas) ? bajas : []
  const productosArray = Array.isArray(productos) ? productos : []

  // Filtrar bajas según búsqueda
  const bajasFiltradas = useMemo(() => {
    if (!searchTerm) return bajasArray
    
    const term = searchTerm.toLowerCase()
    return bajasArray.filter(baja => 
      (baja.product_code?.toLowerCase().includes(term)) ||
      (baja.product_name?.toLowerCase().includes(term)) ||
      (baja.reason?.toLowerCase().includes(term))
    )
  }, [bajasArray, searchTerm])

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.producto_id || !formData.motivo_baja || !formData.cantidad_baja) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    setSubmitting(true)
    try {
      // Crear el objeto de datos solo con los campos que el backend acepta
      const dataToSend = {
        producto_id: parseInt(formData.producto_id),
        motivo_baja: formData.motivo_baja,
        cantidad_baja: parseInt(formData.cantidad_baja)
      }
      
      // Agregar observaciones solo si hay valor
      if (formData.observaciones && formData.observaciones.trim()) {
        dataToSend.observaciones = formData.observaciones
      }
      
      await api.post('/withdrawals', dataToSend)
      
      // Resetear formulario y cerrar modal
      setFormData({
        producto_id: '',
        motivo_baja: '',
        cantidad_baja: '',
        observaciones: ''
      })
      setShowModal(false)
      
      // Recargar datos
      refetch()
      
      alert('✅ Baja registrada exitosamente')
    } catch (err) {
      console.error('Error al registrar baja:', err)
      alert('❌ Error al registrar la baja: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bajas-page">
      <h1>📦 Bajas de Inventario</h1>
      
      {/* Barra de búsqueda y botón nueva baja */}
      <div className="bajas-controls">
        <div className="search-box">
          <label htmlFor="search-bajas">Buscar:</label>
          <input
            id="search-bajas"
            type="text"
            placeholder="Buscar por código, producto o motivo..."
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
          className="btn-nueva-baja"
          onClick={() => setShowModal(true)}
        >
          📝 Nueva Baja
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando bajas...</p>
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
          <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>⚠️ Error al cargar bajas</h3>
          <p style={{ color: '#6b7280' }}>
            {error.message || 'No se pudieron cargar las bajas'}
          </p>
        </div>
      ) : (
        <>
          {/* Contador de bajas */}
          <div className="bajas-counter">
            Bajas cargadas: {bajasFiltradas.length}
            {searchTerm && ` (filtradas de ${bajasArray.length})`}
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Código producto</th>
                  <th>Nombre producto</th>
                  <th>Motivo baja</th>
                  <th>Cantidad baja</th>
                  <th>Fecha baja</th>
                </tr>
              </thead>
              <tbody>
                {bajasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <div style={{ padding: '2rem' }}>
                        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
                          {searchTerm ? 'No se encontraron bajas con ese criterio' : 'No hay bajas registradas'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bajasFiltradas.map((baja) => (
                    <tr key={baja.id}>
                      <td>
                        <code style={{
                          background: '#f3f4f6',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {baja.product_code || 'N/A'}
                        </code>
                      </td>
                      <td>
                        <strong>{baja.product_name || 'Sin nombre'}</strong>
                      </td>
                      <td>
                        <span style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {baja.reason || 'Sin especificar'}
                        </span>
                      </td>
                      <td className="text-center">
                        <strong style={{ fontSize: '1.1rem' }}>
                          {baja.quantity || 0}
                        </strong>
                      </td>
                      <td>
                        {new Date(baja.date || baja.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {/* Modal para nueva baja */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Registrar Nueva Baja</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="producto_id">Producto *</label>
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
                      {producto.code} - {producto.name} (Stock: {producto.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="motivo_baja">Motivo de Baja *</label>
                <select
                  id="motivo_baja"
                  name="motivo_baja"
                  value={formData.motivo_baja}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">Seleccionar motivo...</option>
                  <option value="Producto vencido">Producto vencido</option>
                  <option value="Producto dañado">Producto dañado</option>
                  <option value="Mal estado">Mal estado</option>
                  <option value="Pérdida">Pérdida</option>
                  <option value="Robo">Robo</option>
                  <option value="Obsoleto">Obsoleto</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="cantidad_baja">Cantidad a dar de baja *</label>
                <input
                  id="cantidad_baja"
                  name="cantidad_baja"
                  type="number"
                  min="1"
                  value={formData.cantidad_baja}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Ingrese la cantidad"
                />
              </div>

              <div className="form-group">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Detalles adicionales (opcional)"
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancelar"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-guardar"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : '💾 Guardar Baja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bajas
