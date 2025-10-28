import { useState, useEffect } from 'react'
import './ProductoModal.css'

function ProductoModal({ product, onSave, onClose, loading }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    brand: '',
    purchase_order: '',
    unit: 'Unidad',
    mayor: 0,
    sub_account: '',
    quantity: 0,
    min_stock: 0,
    entry_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    status: 'activo'
  })

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code || '',
        name: product.name || '',
        brand: product.brand || '',
        purchase_order: product.purchase_order || '',
        unit: product.unit || 'Unidad',
        mayor: product.mayor || 0,
        sub_account: product.sub_account || '',
        quantity: product.quantity || 0,
        min_stock: product.min_stock || 0,
        entry_date: product.entry_date || new Date().toISOString().split('T')[0],
        expiry_date: product.expiry_date || '',
        status: product.status || 'activo'
      })
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    const numericFields = ['quantity', 'min_stock', 'mayor']
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Código *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Ej: PROD-001"
              />
            </div>

            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nombre del producto"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Marca del producto"
              />
            </div>

            <div className="form-group">
              <label>Orden de Compra</label>
              <input
                type="text"
                name="purchase_order"
                value={formData.purchase_order}
                onChange={handleChange}
                placeholder="OC-XXX-XX"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Unidad *</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                placeholder="Ej: Unidad, Caja, Paquete"
              />
            </div>

            <div className="form-group">
              <label>Mayor</label>
              <input
                type="number"
                name="mayor"
                value={formData.mayor}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Sub Cuenta</label>
              <input
                type="text"
                name="sub_account"
                value={formData.sub_account}
                onChange={handleChange}
                placeholder="SUB-XXX"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock Actual *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Fecha Ingreso *</label>
              <input
                type="date"
                name="entry_date"
                value={formData.entry_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Fecha Vencimiento</label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductoModal
