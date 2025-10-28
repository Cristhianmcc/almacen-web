import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import './Layout.css'

function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setMobileMenuOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
      {/* Overlay para cerrar menú en móvil */}
      {isMobile && mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Botón hamburguesa en móvil */}
      {isMobile && (
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <span className="hamburger-icon">
            {mobileMenuOpen ? '✕' : '☰'}
          </span>
        </button>
      )}

      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        onLinkClick={closeMobileMenu}
      />
      <main className="main-content" onClick={closeMobileMenu}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
