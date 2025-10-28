import { useApi } from '../hooks/useApi'

function Bajas() {
  // const { data: bajas, loading } = useApi('/wastage')
  // Temporalmente deshabilitado hasta confirmar endpoint correcto
  const bajas = []
  const loading = false

  // Asegurar que bajas sea un array
  const bajasArray = Array.isArray(bajas) ? bajas : []

  return (
    <div className="bajas-page">
      <h1>Registro de Bajas</h1>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando bajas...</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th>Lote</th>
              </tr>
            </thead>
            <tbody>
              {bajasArray.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No hay bajas registradas
                  </td>
                </tr>
              ) : (
                bajasArray.map((baja) => (
                  <tr key={baja.id}>
                    <td>{new Date(baja.created_at).toLocaleDateString()}</td>
                    <td>{baja.product_name}</td>
                    <td>{baja.quantity}</td>
                    <td>{baja.reason}</td>
                    <td>{baja.batch_id || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Bajas
