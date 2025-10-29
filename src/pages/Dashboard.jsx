import { useApi } from '../hooks/useApi'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'
import './Dashboard.css'

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title)

function Dashboard() {
  const { data: productos, loading: loadingProductos } = useApi('/products')
  const { data: movimientos, loading: loadingMovimientos } = useApi('/movements')
  const { data: bajas, loading: loadingBajas } = useApi('/withdrawals')
  const { data: sobrantes, loading: loadingSobrantes } = useApi('/surplus')
  const { data: alertas, loading: loadingAlertas } = useApi('/alerts')

  // Asegurar que todos sean arrays
  const productosArray = Array.isArray(productos) ? productos : []
  const movimientosArray = Array.isArray(movimientos) ? movimientos : []
  const bajasArray = Array.isArray(bajas) ? bajas : []
  const sobrantesArray = Array.isArray(sobrantes) ? sobrantes : []
  const alertasArray = Array.isArray(alertas) ? alertas : []

  const stats = [
    {
      title: 'Total Productos',
      value: productosArray.length,
      icon: '📦',
      color: 'primary',
      loading: loadingProductos
    },
    {
      title: 'Movimientos',
      value: movimientosArray.length,
      icon: '📋',
      color: 'info',
      loading: loadingMovimientos
    },
    {
      title: 'Bajas',
      value: bajasArray.length,
      icon: '❌',
      color: 'danger',
      loading: loadingBajas
    },
    {
      title: 'Sobrantes',
      value: sobrantesArray.length,
      icon: '➕',
      color: 'success',
      loading: loadingSobrantes
    },
    {
      title: 'Alertas',
      value: alertasArray.length, // Usar alertas del backend
      icon: '⚠️',
      color: 'warning',
      loading: loadingAlertas // Nuevo loading
    }
  ]

  // Datos para gráfico de pastel - Distribución de actividades
  const pieData = {
    labels: ['Productos', 'Movimientos', 'Bajas', 'Sobrantes', 'Alertas'],
    datasets: [{
      data: [
        productosArray.length,
        movimientosArray.length,
        bajasArray.length,
        sobrantesArray.length,
        alertasArray.length
      ],
      backgroundColor: [
        '#3b82f6', // Azul
        '#8b5cf6', // Morado
        '#ef4444', // Rojo
        '#10b981', // Verde
        '#f59e0b'  // Naranja
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }

  // Datos para gráfico de barras - Top 5 productos por stock
  const topProductos = productosArray
    .filter(p => p && p.name && p.quantity !== undefined) // Filtrar productos válidos
    .map(p => ({
      nombre: p.name,
      stock: p.quantity || 0,
      codigo: p.code || 'N/A'
    }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)

  console.log('📦 Top 5 Productos por Stock:', topProductos)

  const barData = {
    labels: topProductos.length > 0 
      ? topProductos.map(p => {
          const nombre = p.nombre.substring(0, 15)
          return nombre + (p.nombre.length > 15 ? '...' : '')
        })
      : ['Sin datos'],
    datasets: [{
      label: 'Stock Actual',
      data: topProductos.length > 0 ? topProductos.map(p => p.stock) : [0],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      borderRadius: 8
    }]
  }

  // Datos para gráfico de líneas - Últimos 6 meses de movimientos
  const obtenerUltimosSeisMeses = () => {
    const meses = []
    const nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const hoy = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const mesNum = fecha.getMonth()
      const año = fecha.getFullYear()
      meses.push({
        key: `${año}-${mesNum}`,
        label: nombres[mesNum],
        count: 0
      })
    }
    return meses
  }

  const mesesData = obtenerUltimosSeisMeses()
  
  // Contar movimientos por mes
  movimientosArray.forEach(mov => {
    if (mov.fecha_movimiento || mov.created_at || mov.fecha) {
      const fechaStr = mov.fecha_movimiento || mov.created_at || mov.fecha
      const fecha = new Date(fechaStr)
      const mesNum = fecha.getMonth()
      const año = fecha.getFullYear()
      const key = `${año}-${mesNum}`
      
      const mesEncontrado = mesesData.find(m => m.key === key)
      if (mesEncontrado) {
        mesEncontrado.count++
      }
    }
  })

  const lineData = {
    labels: mesesData.map(m => m.label),
    datasets: [{
      label: 'Movimientos',
      data: mesesData.map(m => m.count),
      borderColor: 'rgb(139, 92, 246)',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true,
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: 'rgb(139, 92, 246)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          generateLabels: (chart) => {
            const data = chart.data
            return data.labels.map((label, i) => ({
              text: `${label}: ${data.datasets[0].data[i]}`,
              fillStyle: data.datasets[0].backgroundColor[i],
              hidden: false,
              index: i
            }))
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <div className="dashboard">
      <h1>📊 Dashboard</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3 className="stat-title">{stat.title}</h3>
              {stat.loading ? (
                <div className="stat-loading">Cargando...</div>
              ) : (
                <p className="stat-value">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Gráficos */}
      <div className="charts-section">
        <h2 className="section-title">📊 Análisis Visual</h2>
        
        <div className="charts-grid">
          {/* Gráfico de Pastel */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Distribución General</h3>
              <span className="chart-badge">Pastel</span>
            </div>
            <div className="chart-container">
              {loadingProductos ? (
                <div className="chart-loading">Cargando datos...</div>
              ) : (
                <Pie data={pieData} options={pieOptions} />
              )}
            </div>
          </div>

          {/* Gráfico de Barras */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Top 5 Productos por Stock</h3>
              <span className="chart-badge">Barras</span>
            </div>
            <div className="chart-container">
              {loadingProductos ? (
                <div className="chart-loading">
                  <div className="loading-spinner"></div>
                  <p>Cargando productos...</p>
                </div>
              ) : topProductos.length === 0 ? (
                <div className="chart-loading">
                  <p style={{fontSize: '1.1rem', color: '#666'}}>📦 No hay productos registrados</p>
                  <p style={{fontSize: '0.9rem', color: '#999', marginTop: '0.5rem'}}>
                    {productosArray.length === 0 
                      ? 'Agrega productos desde la sección "Productos"'
                      : 'Los productos no tienen campos de nombre válidos'}
                  </p>
                  <p style={{fontSize: '0.85rem', color: '#aaa', marginTop: '0.5rem'}}>
                    Total en base de datos: {productosArray.length}
                  </p>
                </div>
              ) : (
                <Bar data={barData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Gráfico de Líneas */}
          <div className="chart-card chart-card-wide">
            <div className="chart-header">
              <h3>Movimientos de los Últimos 6 Meses</h3>
              <span className="chart-badge">Líneas</span>
            </div>
            <div className="chart-container">
              {loadingMovimientos ? (
                <div className="chart-loading">Cargando datos...</div>
              ) : mesesData.every(m => m.count === 0) ? (
                <div className="chart-loading">No hay movimientos registrados</div>
              ) : (
                <Line data={lineData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Alertas de Inventario</h2>
            <span className="badge-count">{alertasArray.length}</span>
          </div>
          {loadingAlertas ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <span>Cargando alertas...</span>
            </div>
          ) : (
            <div className="alert-list">
              {alertasArray
                .slice(0, 5)
                .map(alerta => {
                  const producto = alerta.productos || {}
                  const nivel = alerta.nivel_prioridad?.toLowerCase() || 'media'
                  const esCritico = nivel === 'alta'
                  return (
                    <div key={alerta.id} className="alert-item-modern">
                      <div className="alert-info">
                        <div className="alert-header-row">
                          <span className="product-name-alert">
                            {producto.nombre_item || alerta.nombre_producto || 'Sin nombre'}
                          </span>
                          <span className={`status-badge ${esCritico ? 'critical' : 'warning'}`}>
                            {alerta.tipo_alerta || 'Alerta'}
                          </span>
                        </div>
                        <div className="alert-details">
                          <span className="detail-item">
                            <span className="detail-label">Prioridad:</span>
                            <span className="detail-value">{alerta.nivel_prioridad || 'Media'}</span>
                          </span>
                          <span className="detail-separator">•</span>
                          <span className="detail-item">
                            <span className="detail-label">Estado:</span>
                            <span className="detail-value">{alerta.estado_alerta || 'Pendiente'}</span>
                          </span>
                        </div>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className={`progress-bar ${esCritico ? 'critical' : 'warning'}`}
                          style={{ width: esCritico ? '100%' : '70%' }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              {alertasArray.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">✓</span>
                  <p>No hay alertas pendientes</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Últimos Movimientos</h2>
            <span className="badge-count">{movimientosArray.length}</span>
          </div>
          {loadingMovimientos ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <span>Cargando movimientos...</span>
            </div>
          ) : (
            <div className="movement-list">
              {movimientosArray
                .slice(0, 5)
                .map(mov => (
                  <div key={mov.id} className="movement-item-modern">
                    <div className={`movement-icon ${mov.type}`}>
                      {mov.type === 'entrada' ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 2L8 14M8 2L4 6M8 2L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 14L8 2M8 14L12 10M8 14L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="movement-details">
                      <div className="movement-main">
                        <span className="movement-product">{mov.product_name}</span>
                        <span className={`movement-badge ${mov.type}`}>
                          {mov.type === 'entrada' ? 'Entrada' : 'Salida'}
                        </span>
                      </div>
                      <div className="movement-meta">
                        <span className="meta-item">
                          <span className="meta-label">Cantidad:</span>
                          <span className="meta-value">{mov.quantity}</span>
                        </span>
                        <span className="meta-separator">•</span>
                        <span className="meta-item">
                          <span className="meta-label">Stock:</span>
                          <span className="meta-value">{mov.new_stock}</span>
                        </span>
                        {mov.date && (
                          <>
                            <span className="meta-separator">•</span>
                            <span className="meta-item">
                              <span className="meta-value">
                                {new Date(mov.date).toLocaleDateString('es-ES', { 
                                  day: '2-digit', 
                                  month: 'short' 
                                })}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {movimientosArray.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <p>No hay movimientos registrados</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
