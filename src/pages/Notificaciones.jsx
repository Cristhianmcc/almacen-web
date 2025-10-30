import { useState, useEffect } from 'react'
import './Notificaciones.css'
import notificationService from '../services/notifications'

function Notificaciones() {
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  
  const [preferencias, setPreferencias] = useState({
    email: '',
    habilitado: true,
    horaEnvio: '08:00',
    alertas: {
      stockBajo: true,
      vencimientoProximo: true,
      vencidos: true,
      resumenDiario: false
    },
    umbralDias: 7
  })

  useEffect(() => {
    cargarPreferencias()
  }, [])

  const cargarPreferencias = async () => {
    try {
      setLoading(true)
      
      // Primero intentar cargar desde localStorage
      const emailGuardado = localStorage.getItem('notification_email')
      
      // Luego intentar cargar desde el backend
      const data = await notificationService.obtenerPreferencias(emailGuardado)
      
      if (data) {
        setPreferencias({
          email: data.email || emailGuardado || '',
          habilitado: data.habilitado ?? true,
          horaEnvio: data.hora_envio || '08:00',
          alertas: {
            stockBajo: data.alertas?.stock_bajo ?? true,
            vencimientoProximo: data.alertas?.vencimiento_proximo ?? true,
            vencidos: data.alertas?.vencidos ?? true,
            resumenDiario: data.alertas?.resumen_diario ?? false
          },
          umbralDias: data.umbral_dias || 7
        })
      } else if (emailGuardado) {
        // Si no hay datos en el backend pero sí email guardado, usarlo
        setPreferencias(prev => ({
          ...prev,
          email: emailGuardado
        }))
      }
    } catch (error) {
      console.log('No hay preferencias guardadas, intentando recuperar email local')
      // Recuperar al menos el email de localStorage
      const emailGuardado = localStorage.getItem('notification_email')
      if (emailGuardado) {
        setPreferencias(prev => ({
          ...prev,
          email: emailGuardado
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (campo, valor) => {
    setPreferencias(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const handleAlertaChange = (tipo, valor) => {
    setPreferencias(prev => ({
      ...prev,
      alertas: {
        ...prev.alertas,
        [tipo]: valor
      }
    }))
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    
    if (!preferencias.email) {
      setMensaje({ tipo: 'error', texto: '❌ Por favor ingresa tu email' })
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(preferencias.email)) {
      setMensaje({ tipo: 'error', texto: '❌ Email inválido' })
      return
    }

    try {
      setLoading(true)
      console.log('💾 Guardando preferencias:', preferencias)
      const resultado = await notificationService.guardarPreferencias(preferencias)
      console.log('✅ Resultado:', resultado)
      
      // Guardar email en localStorage para persistencia
      localStorage.setItem('notification_email', preferencias.email)
      console.log('📧 Email guardado en localStorage:', preferencias.email)
      
      // Mensaje detallado de confirmación
      const alertasActivas = Object.entries(preferencias.alertas)
        .filter(([_, activo]) => activo)
        .map(([tipo]) => {
          const nombres = {
            stockBajo: 'Stock Bajo',
            vencimientoProximo: 'Vencimiento Próximo',
            vencidos: 'Productos Vencidos',
            resumenDiario: 'Resumen Diario'
          }
          return nombres[tipo]
        })
      
      setMensaje({ 
        tipo: 'success', 
        texto: `✅ ¡Configuración guardada exitosamente!
        
📧 Email registrado: ${preferencias.email}
🔔 Alertas activas: ${alertasActivas.join(', ')}
⏰ Resumen diario: ${preferencias.horaEnvio}
📅 Anticipación: ${preferencias.umbralDias} días

Las alertas se enviarán automáticamente cuando detectemos productos con stock bajo, próximos a vencer o vencidos. ¡Ya estás protegido! 🎉` 
      })
      
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 8000)
    } catch (error) {
      console.error('❌ Error completo:', error)
      setMensaje({ 
        tipo: 'error', 
        texto: '❌ Error al guardar preferencias: ' + (error.response?.data?.message || error.message)
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProbarEmail = async () => {
    if (!preferencias.email) {
      setMensaje({ tipo: 'error', texto: '❌ Por favor ingresa tu email primero' })
      return
    }

    try {
      setTestLoading(true)
      await notificationService.probarEmail(preferencias.email)
      setMensaje({ 
        tipo: 'success', 
        texto: '✅ Email de prueba enviado. Revisa tu bandeja de entrada.' 
      })
      
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000)
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: '❌ Error al enviar email de prueba: ' + (error.response?.data?.message || error.message)
      })
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="notificaciones-page">
      <div className="page-header">
        <h1>📧 Configuración de Notificaciones</h1>
        <p className="page-description">
          Configura las alertas por email para estar siempre informado sobre tu inventario
        </p>
      </div>

      {mensaje.texto && (
        <div className={`mensaje-alert mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleGuardar} className="config-form">
        {/* Email principal */}
        <div className="config-section">
          <div className="section-header">
            <h2>📬 Email de Notificaciones</h2>
            <p className="section-description">Email donde recibirás las alertas</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={preferencias.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <button 
            type="button" 
            className="btn-test"
            onClick={handleProbarEmail}
            disabled={testLoading || !preferencias.email}
          >
            {testLoading ? '⏳ Enviando...' : '🧪 Enviar Email de Prueba'}
          </button>
        </div>

        {/* Estado de notificaciones */}
        <div className="config-section">
          <div className="section-header">
            <h2>🔔 Estado de Notificaciones</h2>
            <p className="section-description">Activa o desactiva todas las notificaciones</p>
          </div>
          
          <div className="form-group-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={preferencias.habilitado}
                onChange={(e) => handleChange('habilitado', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">
              {preferencias.habilitado ? 'Notificaciones Habilitadas ✅' : 'Notificaciones Deshabilitadas ❌'}
            </span>
          </div>
        </div>

        {/* Tipos de alertas */}
        <div className="config-section">
          <div className="section-header">
            <h2>⚠️ Tipos de Alertas</h2>
            <p className="section-description">Selecciona qué alertas deseas recibir</p>
          </div>

          <div className="alertas-grid">
            <div className="alerta-item">
              <div className="alerta-icon">📉</div>
              <div className="alerta-content">
                <h3>Stock Bajo</h3>
                <p>Productos con stock menor o igual al mínimo</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferencias.alertas.stockBajo}
                  onChange={(e) => handleAlertaChange('stockBajo', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="alerta-item">
              <div className="alerta-icon">⏰</div>
              <div className="alerta-content">
                <h3>Próximos a Vencer</h3>
                <p>Productos que vencen en los próximos {preferencias.umbralDias} días</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferencias.alertas.vencimientoProximo}
                  onChange={(e) => handleAlertaChange('vencimientoProximo', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="alerta-item">
              <div className="alerta-icon">❌</div>
              <div className="alerta-content">
                <h3>Productos Vencidos</h3>
                <p>Productos que ya pasaron su fecha de vencimiento</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferencias.alertas.vencidos}
                  onChange={(e) => handleAlertaChange('vencidos', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="alerta-item">
              <div className="alerta-icon">📊</div>
              <div className="alerta-content">
                <h3>Resumen Diario</h3>
                <p>Reporte diario con todas las alertas del sistema</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferencias.alertas.resumenDiario}
                  onChange={(e) => handleAlertaChange('resumenDiario', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Configuración de tiempo */}
        <div className="config-section">
          <div className="section-header">
            <h2>⏱️ Horario de Envío</h2>
            <p className="section-description">Configura cuándo recibir las notificaciones</p>
          </div>

          <div className="tiempo-config">
            <div className="form-group">
              <label htmlFor="horaEnvio">Hora de envío diario</label>
              <input
                type="time"
                id="horaEnvio"
                value={preferencias.horaEnvio}
                onChange={(e) => handleChange('horaEnvio', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="umbralDias">Días de anticipación para vencimiento</label>
              <select
                id="umbralDias"
                value={preferencias.umbralDias}
                onChange={(e) => handleChange('umbralDias', Number(e.target.value))}
              >
                <option value={3}>3 días</option>
                <option value={5}>5 días</option>
                <option value={7}>7 días</option>
                <option value={10}>10 días</option>
                <option value={15}>15 días</option>
                <option value={30}>30 días</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="info-box">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h4>Sobre las Notificaciones</h4>
            <ul>
              <li>Las notificaciones se envían automáticamente a la hora configurada</li>
              <li>Solo recibirás emails si hay alertas activas</li>
            </ul>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Notificaciones
