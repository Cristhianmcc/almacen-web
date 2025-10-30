import { useState, useEffect } from 'react'
import './ProductoModal.css'

function ProductoModal({ product, onSave, onClose, loading }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    brand: '',
    purchase_order: '',
    unit: 'Unidad',
    mayor: '',
    sub_account: '',
    quantity: '',
    expiry_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (product) {
      // Extraer solo la fecha (YYYY-MM-DD) del campo expiry_date
      let fechaVencimiento = new Date().toISOString().split('T')[0]
      if (product.expiry_date) {
        // Si viene con timestamp ISO, tomar solo la parte de fecha
        fechaVencimiento = product.expiry_date.split('T')[0]
      }
      
      setFormData({
        code: product.code || '',
        name: product.name || '',
        brand: product.brand || '',
        purchase_order: product.purchase_order || '',
        unit: product.unit || 'Unidad',
        mayor: product.mayor || '',
        sub_account: product.sub_account || '',
        quantity: product.quantity || '',
        expiry_date: fechaVencimiento
      })
      
      console.log('📝 [ProductoModal] Cargando producto para editar:')
      console.log('   Fecha del backend:', product.expiry_date)
      console.log('   Fecha en el form:', fechaVencimiento)
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validaciones básicas (solo campos obligatorios del desktop)
    if (!formData.code?.trim()) {
      alert('❌ El código es obligatorio')
      return
    }
    
    if (!formData.name?.trim()) {
      alert('❌ El nombre es obligatorio')
      return
    }
    
    if (!formData.unit?.trim()) {
      alert('❌ La medida es obligatoria')
      return
    }
    
    if (!formData.quantity || formData.quantity === '') {
      alert('❌ El stock inicial es obligatorio')
      return
    }
    
    // Preparar datos exactamente como el desktop
    const cleanData = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      brand: formData.brand?.trim() || '',
      purchase_order: formData.purchase_order?.trim() || '',
      unit: formData.unit.trim(),
      mayor: formData.mayor ? Number(formData.mayor) : 0,
      sub_account: formData.sub_account?.trim() || '',
      quantity: Number(formData.quantity),
      expiry_date: formData.expiry_date
    }
    
    console.log('[ProductoModal] Datos a enviar:', cleanData)
    onSave(cleanData)
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
              <label>Medida *</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                placeholder="Ej: Unidad"
              />
            </div>

            <div className="form-group">
              <label>Mayor</label>
              <input
                type="text"
                name="mayor"
                value={formData.mayor}
                onChange={handleChange}
                placeholder="Ej: 1301"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Subcuenta</label>
              <input
                type="text"
                name="sub_account"
                value={formData.sub_account}
                onChange={handleChange}
                placeholder="SUB-XXX"
              />
            </div>

            <div className="form-group">
              <label>Stock inicial *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                placeholder="Cantidad inicial"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha vencimiento *</label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                required
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
