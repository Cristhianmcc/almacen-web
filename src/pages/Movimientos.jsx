import { useState } from 'react'
import { useApi, useApiMutation } from '../hooks/useApi'
import './Movimientos.css'

function Movimientos() {
  const { data: movimientos, loading, refetch } = useApi('/movements')
  const { data: productos } = useApi('/products')
  const { mutate, loading: mutating } = useApiMutation()
  
  // Asegurar que sean arrays
  const movimientosArray = Array.isArray(movimientos) ? movimientos : []
  const productosArray = Array.isArray(productos) ? productos : []
  
  const [tipoMovimiento, setTipoMovimiento] = useState('entrada')
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 0,
    reason: '',
    expiry_date: ''
  })
  
  // Estados para el buscador de productos
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Filtrar productos según búsqueda
  const filteredProducts = productosArray.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'product_id' ? Number(value) : value
    }))
  }
  
  // Manejar selección de producto desde el buscador
  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setFormData(prev => ({
      ...prev,
      product_id: product.id
    }))
    setSearchTerm(product.name)
    setShowDropdown(false)
  }
  
  // Limpiar selección de producto
  const handleClearProduct = () => {
    setSelectedProduct(null)
    setFormData(prev => ({
      ...prev,
      product_id: ''
    }))
    setSearchTerm('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.product_id) {
      alert('Seleccione un producto')
      return
    }

    if (formData.quantity <= 0) {
      alert('La cantidad debe ser mayor a 0')
      return
    }

    console.log('[Movimientos] Datos del formulario:', formData)
    console.log('[Movimientos] Tipo de movimiento:', tipoMovimiento)

    const endpoint = tipoMovimiento === 'entrada' ? '/movements/entry' : '/movements/exit'
    const data = {
      ...formData,
      type: tipoMovimiento
    }

    // Remove expiry_date if not entrada or if empty
    if (tipoMovimiento !== 'entrada' || !data.expiry_date) {
      delete data.expiry_date
    }

    console.log('[Movimientos] Datos a enviar:', data)
    console.log('[Movimientos] Endpoint:', endpoint)

    const result = await mutate('POST', endpoint, data)
    
    console.log('[Movimientos] Resultado:', result)
    
    if (result.success) {
      alert(`✅ ${tipoMovimiento === 'entrada' ? 'Entrada' : 'Salida'} registrada correctamente`)
      setFormData({
        product_id: '',
        quantity: 0,
        reason: '',
        expiry_date: ''
      })
      // Limpiar también el buscador
      setSearchTerm('')
      setSelectedProduct(null)
      refetch()
    } else {
      console.error('[Movimientos] Error detallado:', result)
      alert(`❌ Error al registrar ${tipoMovimiento}:\n\n${result.error}\n\nRevisa la consola (F12) para más detalles.`)
    }
  }

  return (
    <div className="movimientos-page">
      <h1>📋 Registro de Movimientos</h1>

      <div className="movimientos-grid">
        <div className="card">
          <h2>Nuevo Movimiento</h2>
          
          <div className="tipo-selector">
            <button
              className={`tipo-btn ${tipoMovimiento === 'entrada' ? 'active' : ''}`}
              onClick={() => setTipoMovimiento('entrada')}
            >
              ⬆️ Entrada
            </button>
            <button
              className={`tipo-btn ${tipoMovimiento === 'salida' ? 'active' : ''}`}
              onClick={() => setTipoMovimiento('salida')}
            >
              ⬇️ Salida
            </button>
          </div>

          <form onSubmit={handleSubmit} className="movimiento-form">
            <div className="form-group">
              <label>Producto *</label>
              
              {/* Buscador de productos con autocompletado */}
              <div className="product-search-container">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar por nombre, código o marca..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowDropdown(true)
                      if (e.target.value === '') {
                        handleClearProduct()
                      }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    required
                  />
                  
                  {selectedProduct && (
                    <button
                      type="button"
                      className="clear-btn"
                      onClick={handleClearProduct}
                      title="Limpiar selección"
                    >
                      ✕
                    </button>
                  )}
                  
                  <span className="search-icon">🔍</span>
                </div>
                
                {/* Dropdown con resultados */}
                {showDropdown && searchTerm && !selectedProduct && (
                  <div className="search-dropdown">
                    {filteredProducts.length > 0 ? (
                      <>
                        <div className="dropdown-header">
                          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                        </div>
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className="dropdown-item"
                            onClick={() => handleSelectProduct(product)}
                          >
                            <div className="product-info">
                              <div className="product-name">{product.name}</div>
                              <div className="product-details">
                                <span className="product-code">📦 {product.code}</span>
                                {product.brand && (
                                  <span className="product-brand">🏷️ {product.brand}</span>
                                )}
                                <span className={`product-stock ${product.quantity < 20 ? 'low' : ''}`}>
                                  Stock: {product.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="dropdown-empty">
                        ❌ No se encontraron productos con "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
                
                {/* Producto seleccionado */}
                {selectedProduct && (
                  <div className="selected-product">
                    <div className="selected-product-info">
                      <strong>{selectedProduct.name}</strong>
                      <span className="selected-product-meta">
                        {selectedProduct.code} • Stock disponible: {selectedProduct.quantity}
                      </span>
                    </div>
                    <span className="selected-badge">✓</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Cantidad *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            {tipoMovimiento === 'entrada' && (
              <div className="form-group">
                <label>Fecha de Vencimiento</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            <div className="form-group">
              <label>Motivo</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="3"
                placeholder="Descripción del movimiento"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-${tipoMovimiento === 'entrada' ? 'success' : 'warning'} btn-block`}
              disabled={mutating}
            >
              {mutating ? 'Registrando...' : `Registrar ${tipoMovimiento === 'entrada' ? 'Entrada' : 'Salida'}`}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Historial de Movimientos</h2>
          
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="movimientos-list">
              {movimientosArray.slice(0, 10).map(mov => (
                <div key={mov.id} className="movimiento-item">
                  <span className={`movimiento-type-badge badge-${mov.type}`}>
                    {mov.type === 'entrada' ? '⬆️' : '⬇️'}
                  </span>
                  <div className="movimiento-info">
                    <strong>{mov.product_name}</strong>
                    <small>
                      {new Date(mov.created_at).toLocaleString()} - Cantidad: {mov.quantity}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Movimientos
