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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'product_id' ? Number(value) : value
    }))
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

    const endpoint = tipoMovimiento === 'entrada' ? '/movements/entry' : '/movements/exit'
    const data = {
      ...formData,
      type: tipoMovimiento
    }

    // Remove expiry_date if not entrada
    if (tipoMovimiento !== 'entrada') {
      delete data.expiry_date
    }

    const result = await mutate('POST', endpoint, data)
    
    if (result.success) {
      alert(`${tipoMovimiento === 'entrada' ? 'Entrada' : 'Salida'} registrada correctamente`)
      setFormData({
        product_id: '',
        quantity: 0,
        reason: '',
        expiry_date: ''
      })
      refetch()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  return (
    <div className="movimientos-page">
      <h1>Registro de Movimientos</h1>

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
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un producto</option>
                {productosArray.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.quantity})
                  </option>
                ))}
              </select>
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
