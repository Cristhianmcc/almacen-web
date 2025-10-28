import { NavLink } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/productos', label: 'Productos', icon: '📦' },
    { path: '/movimientos', label: 'Movimientos', icon: '📋' },
    { path: '/alertas', label: 'Alertas', icon: '⚠️' },
    { path: '/bajas', label: 'Bajas', icon: '❌' },
    { path: '/sobrantes', label: 'Sobrantes', icon: '➕' },
    { path: '/reportes', label: 'Reportes', icon: '📄' },
    { path: '/lotes', label: 'Lotes FEFO', icon: '🏷️' }
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Sistema de Almacén</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
