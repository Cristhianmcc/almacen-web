import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
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
    <Routes>
      <Route path="/" element={<Layout />}>
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
  )
}

export default App
