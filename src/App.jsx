import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Movimientos from './pages/Movimientos'
import Alertas from './pages/Alertas'
import Bajas from './pages/Bajas'
import Sobrantes from './pages/Sobrantes'
import Reportes from './pages/Reportes'
import Lotes from './pages/Lotes'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Ruta pública de login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="productos" element={<Productos />} />
          <Route path="movimientos" element={<Movimientos />} />
          <Route path="alertas" element={<Alertas />} />
          <Route path="bajas" element={<Bajas />} />
          <Route path="sobrantes" element={<Sobrantes />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="lotes" element={<Lotes />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
