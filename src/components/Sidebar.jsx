import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Sidebar.css'

function Sidebar({ collapsed, onToggle }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

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

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      const result = await logout()
      if (result.success) {
        navigate('/login')
      }
    }
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{collapsed ? 'SA' : 'Sistema de Almacén'}</h2>
        <button 
          className="toggle-btn" 
          onClick={onToggle}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            title={collapsed ? item.label : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="user-info">
            <span className="user-icon">👤</span>
            <div className="user-details">
              <p className="user-name">Admin</p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
        )}
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <span className="logout-icon">🚪</span>
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
