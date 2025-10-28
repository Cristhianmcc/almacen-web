import { useApi } from '../hooks/useApi'

function Sobrantes() {
  // const { data: sobrantes, loading } = useApi('/surplus')
  // Temporalmente deshabilitado hasta confirmar endpoint correcto
  const sobrantes = []
  const loading = false

  // Asegurar que sobrantes sea un array
  const sobrantesArray = Array.isArray(sobrantes) ? sobrantes : []

  return (
    <div className="sobrantes-page">
      <h1>Registro de Sobrantes</h1>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando sobrantes...</p>
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
              {sobrantesArray.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No hay sobrantes registrados
                  </td>
                </tr>
              ) : (
                sobrantesArray.map((sobrante) => (
                  <tr key={sobrante.id}>
                    <td>{new Date(sobrante.created_at).toLocaleDateString()}</td>
                    <td>{sobrante.product_name}</td>
                    <td>{sobrante.quantity}</td>
                    <td>{sobrante.reason}</td>
                    <td>{sobrante.batch_id || 'N/A'}</td>
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

export default Sobrantes
