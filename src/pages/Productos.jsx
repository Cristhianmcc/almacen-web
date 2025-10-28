import { useState } from 'react'
import { useApi, useApiMutation } from '../hooks/useApi'
import ProductoModal from '../components/ProductoModal'
import './Productos.css'

function Productos() {
  const { data: productos, loading, error, refetch } = useApi('/products')
  const { mutate, loading: mutating } = useApiMutation()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Asegurar que productos sea un array
  const productosArray = Array.isArray(productos) ? productos : []

  const filteredProducts = productosArray.filter(p =>
    p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) {
      return
    }

    const result = await mutate('DELETE', `/products/${id}`)
    if (result.success) {
      alert('Producto eliminado correctamente')
      refetch()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleSave = async (productData) => {
    const method = editingProduct ? 'PUT' : 'POST'
    const endpoint = editingProduct 
      ? `/products/${editingProduct.id}` 
      : '/products'

    const result = await mutate(method, endpoint, productData)
    
    if (result.success) {
      alert(editingProduct ? 'Producto actualizado' : 'Producto creado')
      setShowModal(false)
      refetch()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  return (
    <div className="productos-page">
      <div className="page-header">
        <h1>Gestión de Productos</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ Nuevo Producto
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Stock Actual</th>
                <th>Mayor</th>
                <th>Unidad</th>
                <th>Fecha Venc.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts?.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProducts?.map((producto) => {
                  const isLowStock = (producto.quantity || 0) <= (producto.min_stock || 0)
                  const isExpiringSoon = producto.expiry_date && 
                    new Date(producto.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  
                  return (
                    <tr key={producto.id || producto._id}>
                      <td>{producto.code || 'N/A'}</td>
                      <td className="product-name">{producto.name || 'Sin nombre'}</td>
                      <td>{producto.brand || 'N/A'}</td>
                      <td>
                        <span className={isLowStock ? 'quantity-low' : ''}>
                          {producto.quantity || 0}
                        </span>
                      </td>
                      <td>{producto.mayor || 0}</td>
                      <td>{producto.unit || 'N/A'}</td>
                      <td className={isExpiringSoon ? 'expiry-warning' : ''}>
                        {producto.expiry_date ? new Date(producto.expiry_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge badge-${isLowStock ? 'warning' : 'success'}`}>
                          {isLowStock ? '⚠️ Bajo' : '✅ OK'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEdit(producto)}
                            disabled={mutating}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(producto.id || producto._id)}
                            disabled={mutating}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProductoModal
          product={editingProduct}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          loading={mutating}
        />
      )}
    </div>
  )
}

export default Productos
