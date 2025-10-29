# 🔔 Sistema de Alertas Automáticas

## 📋 Descripción

Este documento explica cómo implementar el **verificador automático de alertas** que envía notificaciones por email cuando detecta:

- 📉 **Stock Bajo**: Productos por debajo del stock mínimo
- ⏰ **Vencimiento Próximo**: Productos que vencen en X días
- ❌ **Vencidos**: Productos con fecha de vencimiento pasada
- 📊 **Resumen Diario**: Reporte del estado del inventario

## 🏗️ Arquitectura

```
Backend (almacen-instituto)
├── src/
│   ├── services/
│   │   └── alertasService.js  ← NUEVO ARCHIVO
│   └── app.js  ← Inicializar el servicio aquí
```

---

## 📝 Paso 1: Crear el Servicio de Alertas

Crea el archivo `c:\Users\Cris\Desktop\almacen-instituto\src\services\alertasService.js`:

```javascript
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Configuración
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Almacén de preferencias (en memoria - puedes usar BD si prefieres)
let notificationPreferences = new Map();

class AlertasService {
  constructor() {
    this.isRunning = false;
  }

  // Inicializar el servicio
  init() {
    if (this.isRunning) {
      console.log('⚠️ El servicio de alertas ya está corriendo');
      return;
    }

    console.log('🔔 Inicializando servicio de alertas automáticas...');

    // Verificar cada hora si hay alertas que enviar
    cron.schedule('0 * * * *', async () => {
      console.log('⏰ Verificando alertas automáticas...');
      await this.verificarYEnviarAlertas();
    });

    // Verificar resumen diario según configuración de usuarios
    cron.schedule('0 * * * *', async () => {
      await this.verificarResumenDiario();
    });

    this.isRunning = true;
    console.log('✅ Servicio de alertas iniciado correctamente');
    console.log('   - Verificación cada hora');
    console.log('   - Resumen diario según configuración');
  }

  // Registrar preferencias de un usuario
  registrarPreferencias(preferencias) {
    const { email } = preferencias;
    notificationPreferences.set(email, {
      ...preferencias,
      ultimoEnvio: {
        stock_bajo: null,
        vencimiento_proximo: null,
        vencido: null,
        resumen_diario: null
      }
    });
    console.log(`✅ Preferencias registradas para: ${email}`);
  }

  // Obtener preferencias de un usuario
  obtenerPreferencias(email) {
    return notificationPreferences.get(email);
  }

  // Verificar si debe enviar alerta (evitar spam)
  debeEnviarAlerta(email, tipoAlerta) {
    const prefs = notificationPreferences.get(email);
    if (!prefs || !prefs.enabled) return false;
    if (!prefs.alertTypes?.[tipoAlerta]) return false;

    // Evitar enviar la misma alerta más de una vez cada 24 horas
    const ultimoEnvio = prefs.ultimoEnvio?.[tipoAlerta];
    if (ultimoEnvio) {
      const horasDesdeUltimoEnvio = (Date.now() - ultimoEnvio) / (1000 * 60 * 60);
      if (horasDesdeUltimoEnvio < 24) {
        return false;
      }
    }

    return true;
  }

  // Marcar que se envió una alerta
  marcarEnvioAlerta(email, tipoAlerta) {
    const prefs = notificationPreferences.get(email);
    if (prefs) {
      prefs.ultimoEnvio[tipoAlerta] = Date.now();
      notificationPreferences.set(email, prefs);
    }
  }

  // Verificar y enviar todas las alertas
  async verificarYEnviarAlertas() {
    try {
      // Obtener todos los usuarios con notificaciones activas
      const usuariosActivos = Array.from(notificationPreferences.entries())
        .filter(([_, prefs]) => prefs.enabled)
        .map(([email, prefs]) => ({ email, prefs }));

      if (usuariosActivos.length === 0) {
        console.log('ℹ️ No hay usuarios con notificaciones activas');
        return;
      }

      console.log(`📧 Verificando alertas para ${usuariosActivos.length} usuario(s)...`);

      for (const { email, prefs } of usuariosActivos) {
        // Stock Bajo
        if (this.debeEnviarAlerta(email, 'stockBajo')) {
          const productosStockBajo = await this.obtenerProductosStockBajo();
          if (productosStockBajo.length > 0) {
            await this.enviarNotificacion(email, 'stock_bajo', productosStockBajo);
            this.marcarEnvioAlerta(email, 'stockBajo');
          }
        }

        // Vencimiento Próximo
        if (this.debeEnviarAlerta(email, 'vencimientoProximo')) {
          const umbralDias = prefs.umbralDias || 7;
          const productosVencimiento = await this.obtenerProductosProximosVencer(umbralDias);
          if (productosVencimiento.length > 0) {
            await this.enviarNotificacion(email, 'vencimiento_proximo', productosVencimiento);
            this.marcarEnvioAlerta(email, 'vencimientoProximo');
          }
        }

        // Vencidos
        if (this.debeEnviarAlerta(email, 'vencidos')) {
          const productosVencidos = await this.obtenerProductosVencidos();
          if (productosVencidos.length > 0) {
            await this.enviarNotificacion(email, 'vencido', productosVencidos);
            this.marcarEnvioAlerta(email, 'vencidos');
          }
        }
      }

      console.log('✅ Verificación de alertas completada');
    } catch (error) {
      console.error('❌ Error al verificar alertas:', error);
    }
  }

  // Verificar resumen diario
  async verificarResumenDiario() {
    try {
      const horaActual = new Date().getHours();

      const usuariosParaResumen = Array.from(notificationPreferences.entries())
        .filter(([_, prefs]) => {
          if (!prefs.enabled || !prefs.alertTypes?.resumenDiario) return false;
          
          const horaEnvio = parseInt(prefs.horaEnvio?.split(':')[0] || '9');
          return horaActual === horaEnvio;
        })
        .map(([email]) => email);

      if (usuariosParaResumen.length === 0) return;

      console.log(`📊 Enviando resumen diario a ${usuariosParaResumen.length} usuario(s)...`);

      const datosResumen = await this.obtenerDatosResumenDiario();

      for (const email of usuariosParaResumen) {
        if (this.debeEnviarAlerta(email, 'resumenDiario')) {
          await this.enviarResumenDiario(email, datosResumen);
          this.marcarEnvioAlerta(email, 'resumenDiario');
        }
      }
    } catch (error) {
      console.error('❌ Error al enviar resumen diario:', error);
    }
  }

  // Obtener productos con stock bajo
  async obtenerProductosStockBajo() {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .lt('stock_actual', supabase.raw('stock_minimo'));

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      return [];
    }
  }

  // Obtener productos próximos a vencer
  async obtenerProductosProximosVencer(dias) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + dias);

      const { data, error } = await supabase
        .from('lotes')
        .select(`
          *,
          producto:productos(*)
        `)
        .lte('fecha_vencimiento', fechaLimite.toISOString())
        .gte('fecha_vencimiento', new Date().toISOString())
        .gt('stock_actual', 0);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener productos próximos a vencer:', error);
      return [];
    }
  }

  // Obtener productos vencidos
  async obtenerProductosVencidos() {
    try {
      const { data, error } = await supabase
        .from('lotes')
        .select(`
          *,
          producto:productos(*)
        `)
        .lt('fecha_vencimiento', new Date().toISOString())
        .gt('stock_actual', 0);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener productos vencidos:', error);
      return [];
    }
  }

  // Obtener datos para resumen diario
  async obtenerDatosResumenDiario() {
    try {
      const [productos, stockBajo, vencimiento, vencidos] = await Promise.all([
        supabase.from('productos').select('*', { count: 'exact', head: true }),
        this.obtenerProductosStockBajo(),
        this.obtenerProductosProximosVencer(7),
        this.obtenerProductosVencidos()
      ]);

      return {
        totalProductos: productos.count || 0,
        stockBajo: stockBajo.length,
        vencimientoProximo: vencimiento.length,
        vencidos: vencidos.length,
        productosStockBajo: stockBajo.slice(0, 5), // Top 5
        productosVencimiento: vencimiento.slice(0, 5)
      };
    } catch (error) {
      console.error('Error al obtener datos de resumen:', error);
      return {
        totalProductos: 0,
        stockBajo: 0,
        vencimientoProximo: 0,
        vencidos: 0,
        productosStockBajo: [],
        productosVencimiento: []
      };
    }
  }

  // Enviar notificación por email
  async enviarNotificacion(email, tipo, productos) {
    try {
      const htmlContent = this.generarHTMLNotificacion(tipo, productos);
      
      await resend.emails.send({
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: this.obtenerAsuntoEmail(tipo),
        html: htmlContent
      });

      console.log(`✅ Notificación enviada a ${email} - Tipo: ${tipo}`);
    } catch (error) {
      console.error(`❌ Error al enviar notificación a ${email}:`, error);
    }
  }

  // Enviar resumen diario
  async enviarResumenDiario(email, datos) {
    try {
      const htmlContent = this.generarHTMLResumen(datos);
      
      await resend.emails.send({
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: '📊 Resumen Diario - Almacén Lurín',
        html: htmlContent
      });

      console.log(`✅ Resumen diario enviado a ${email}`);
    } catch (error) {
      console.error(`❌ Error al enviar resumen a ${email}:`, error);
    }
  }

  // Obtener asunto del email según tipo
  obtenerAsuntoEmail(tipo) {
    const asuntos = {
      stock_bajo: '⚠️ Alerta: Productos con Stock Bajo',
      vencimiento_proximo: '⏰ Alerta: Productos Próximos a Vencer',
      vencido: '❌ Alerta: Productos Vencidos'
    };
    return asuntos[tipo] || 'Notificación del Sistema';
  }

  // Generar HTML para notificación
  generarHTMLNotificacion(tipo, productos) {
    const titulos = {
      stock_bajo: '📉 Productos con Stock Bajo',
      vencimiento_proximo: '⏰ Productos Próximos a Vencer',
      vencido: '❌ Productos Vencidos'
    };

    const descripciones = {
      stock_bajo: 'Los siguientes productos están por debajo del stock mínimo:',
      vencimiento_proximo: 'Los siguientes lotes están próximos a vencer:',
      vencido: 'Los siguientes lotes han vencido:'
    };

    const productosHTML = productos.map((p, index) => {
      if (tipo === 'stock_bajo') {
        return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-align: center;">${index + 1}</td>
            <td style="padding: 12px;">${p.nombre_item || p.name || 'N/A'}</td>
            <td style="padding: 12px; text-align: center;">${p.stock_actual || 0}</td>
            <td style="padding: 12px; text-align: center;">${p.stock_minimo || 0}</td>
          </tr>
        `;
      } else {
        const producto = p.producto || p;
        const fechaVencimiento = new Date(p.fecha_vencimiento).toLocaleDateString('es-PE');
        return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-align: center;">${index + 1}</td>
            <td style="padding: 12px;">${producto.nombre_item || producto.name || 'N/A'}</td>
            <td style="padding: 12px; text-align: center;">${p.numero_lote || 'N/A'}</td>
            <td style="padding: 12px; text-align: center;">${fechaVencimiento}</td>
            <td style="padding: 12px; text-align: center;">${p.stock_actual || 0}</td>
          </tr>
        `;
      }
    }).join('');

    const headers = tipo === 'stock_bajo' 
      ? '<th style="padding: 12px; text-align: center;">#</th><th style="padding: 12px;">Producto</th><th style="padding: 12px; text-align: center;">Stock Actual</th><th style="padding: 12px; text-align: center;">Stock Mínimo</th>'
      : '<th style="padding: 12px; text-align: center;">#</th><th style="padding: 12px;">Producto</th><th style="padding: 12px; text-align: center;">Lote</th><th style="padding: 12px; text-align: center;">Vencimiento</th><th style="padding: 12px; text-align: center;">Stock</th>';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${titulos[tipo]}</h1>
            </div>
            
            <div style="padding: 40px 20px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                ${descripciones[tipo]}
              </p>
              
              <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    ${headers}
                  </tr>
                </thead>
                <tbody>
                  ${productosHTML}
                </tbody>
              </table>
              
              <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>⚡ Acción requerida:</strong> Revisa tu inventario y toma las medidas necesarias.
                </p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  📅 ${new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Sistema de Gestión de Almacén - IESTP Lurín<br>
                Este es un mensaje automático, no responder a este correo.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generar HTML para resumen diario
  generarHTMLResumen(datos) {
    const top5StockBajo = datos.productosStockBajo.slice(0, 5).map((p, i) => `
      <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
        <strong>${p.nombre_item}</strong> - Stock: ${p.stock_actual}/${p.stock_minimo}
      </li>
    `).join('');

    const top5Vencimiento = datos.productosVencimiento.slice(0, 5).map((p, i) => {
      const producto = p.producto || p;
      return `
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
          <strong>${producto.nombre_item}</strong> - Lote ${p.numero_lote} - Vence: ${new Date(p.fecha_vencimiento).toLocaleDateString('es-PE')}
        </li>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📊 Resumen Diario</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0;">Almacén Lurín</p>
            </div>
            
            <div style="padding: 40px 20px;">
              <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">Estado del Inventario</h2>
              
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${datos.totalProductos}</div>
                  <div style="color: #1e3a8a; font-size: 14px; margin-top: 5px;">Total Productos</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #92400e;">${datos.stockBajo}</div>
                  <div style="color: #78350f; font-size: 14px; margin-top: 5px;">Stock Bajo</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #9a3412;">${datos.vencimientoProximo}</div>
                  <div style="color: #7c2d12; font-size: 14px; margin-top: 5px;">Por Vencer</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%); padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #991b1b;">${datos.vencidos}</div>
                  <div style="color: #7f1d1d; font-size: 14px; margin-top: 5px;">Vencidos</div>
                </div>
              </div>
              
              ${datos.stockBajo > 0 ? `
                <div style="margin-bottom: 30px;">
                  <h3 style="color: #92400e; font-size: 18px; margin-bottom: 10px;">⚠️ Top 5 - Stock Bajo</h3>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    ${top5StockBajo}
                  </ul>
                </div>
              ` : ''}
              
              ${datos.vencimientoProximo > 0 ? `
                <div style="margin-bottom: 30px;">
                  <h3 style="color: #9a3412; font-size: 18px; margin-bottom: 10px;">⏰ Top 5 - Próximos a Vencer</h3>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    ${top5Vencimiento}
                  </ul>
                </div>
              ` : ''}
              
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  📅 ${new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Sistema de Gestión de Almacén - IESTP Lurín<br>
                Este es un mensaje automático, no responder a este correo.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

// Exportar instancia única
const alertasService = new AlertasService();
module.exports = alertasService;
```

---

## 📝 Paso 2: Modificar las Rutas de Notificaciones

Actualiza `c:\Users\Cris\Desktop\almacen-instituto\src\routes\notificaciones.js`:

**Cambiar:**

```javascript
// Almacén de preferencias en memoria
const notificationPreferences = new Map();
```

**Por:**

```javascript
// Importar el servicio de alertas
const alertasService = require('../services/alertasService');
```

**Y cambiar la ruta POST /preferencias:**

```javascript
router.post('/preferencias', async (req, res) => {
  try {
    const preferencias = req.body;
    
    // Guardar en el servicio de alertas
    alertasService.registrarPreferencias(preferencias);
    
    res.json({ 
      success: true, 
      message: 'Preferencias guardadas correctamente' 
    });
  } catch (error) {
    console.error('Error al guardar preferencias:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al guardar preferencias' 
    });
  }
});
```

**Y cambiar la ruta GET /preferencias:**

```javascript
router.get('/preferencias', async (req, res) => {
  try {
    const email = req.query.email;
    
    if (!email) {
      return res.json(null);
    }

    const preferencias = alertasService.obtenerPreferencias(email);
    
    res.json(preferencias || null);
  } catch (error) {
    console.error('Error al obtener preferencias:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener preferencias' 
    });
  }
});
```

---

## 📝 Paso 3: Inicializar el Servicio en app.js

Edita `c:\Users\Cris\Desktop\almacen-instituto\src\app.js`:

**Agregar DESPUÉS de los require de rutas:**

```javascript
// Importar el servicio de alertas
const alertasService = require('./services/alertasService');
```

**Agregar DESPUÉS de registrar todas las rutas (antes de app.listen):**

```javascript
// Inicializar servicio de alertas automáticas
alertasService.init();
```

---

## 📦 Paso 4: Instalar Dependencias

Ejecuta en el backend:

```bash
npm install node-cron
```

(Las demás dependencias ya las tienes: `@supabase/supabase-js`, `resend`)

---

## 🚀 Paso 5: Reiniciar el Backend

```bash
# Detener el backend (Ctrl+C)
# Iniciar de nuevo
npm run start
```

Deberías ver:

```
🔔 Inicializando servicio de alertas automáticas...
✅ Servicio de alertas iniciado correctamente
   - Verificación cada hora
   - Resumen diario según configuración
```

---

## 🧪 Paso 6: Configurar tus Notificaciones

1. Ve a http://localhost:3000/notificaciones
2. Configura tu email: `elcapomlc01@gmail.com`
3. Activa las alertas que quieras:
   - ✅ Productos con stock bajo
   - ✅ Productos próximos a vencer
   - ✅ Productos vencidos
   - ✅ Resumen diario del inventario
4. Configura la hora del resumen (ej: 09:00)
5. Configura los días de anticipación (ej: 7 días)
6. Guarda la configuración

---

## ⏰ Funcionamiento Automático

### Verificación cada hora:
- El sistema revisa **cada hora** si hay:
  - Productos con stock bajo
  - Productos próximos a vencer
  - Productos vencidos
- Si encuentra alguno, **envía un email automáticamente**
- **Evita spam**: No envía la misma alerta más de 1 vez cada 24 horas

### Resumen diario:
- Se envía **a la hora que configuraste** (ej: 09:00)
- Incluye:
  - Total de productos
  - Cantidad con stock bajo
  - Cantidad próxima a vencer
  - Cantidad vencidos
  - Top 5 productos más críticos

---

## 📊 Logs en Consola

Verás mensajes como:

```
⏰ Verificando alertas automáticas...
📧 Verificando alertas para 1 usuario(s)...
✅ Notificación enviada a elcapomlc01@gmail.com - Tipo: stock_bajo
✅ Verificación de alertas completada
```

---

## 🎯 Resultado Final

1. ✅ **Emails de prueba** funcionan (ya lo tienes)
2. ✅ **Alertas automáticas** cada hora
3. ✅ **Resumen diario** a la hora configurada
4. ✅ **Sin spam** (máximo 1 email de cada tipo por día)
5. ✅ **Emails bonitos** con gradientes y tablas
6. ✅ **Datos en tiempo real** desde tu base de datos

---

## 🔧 Personalización

### Cambiar frecuencia de verificación:

En `alertasService.js`, cambia:

```javascript
// Cada hora
cron.schedule('0 * * * *', async () => { ... });

// Cada 30 minutos
cron.schedule('*/30 * * * *', async () => { ... });

// Cada 6 horas
cron.schedule('0 */6 * * *', async () => { ... });
```

### Cambiar umbral de días por defecto:

```javascript
const umbralDias = prefs.umbralDias || 14; // 14 días en lugar de 7
```

---

## 🐛 Troubleshooting

**Problema**: No llegan los emails automáticos

**Solución**:
1. Verifica que el backend esté corriendo
2. Revisa los logs de la consola del backend
3. Verifica que guardaste las preferencias correctamente
4. Verifica que tienes productos que cumplan las condiciones

**Problema**: Llegan demasiados emails

**Solución**: El sistema ya tiene protección anti-spam (1 email de cada tipo cada 24h). Si aún así llegan muchos, aumenta el umbral de horas en `debeEnviarAlerta()`.

---

## 📧 Ejemplo de Email que Recibirás

### Alerta de Stock Bajo:
```
⚠️ Productos con Stock Bajo

Los siguientes productos están por debajo del stock mínimo:

| # | Producto | Stock Actual | Stock Mínimo |
|---|----------|--------------|--------------|
| 1 | Paracetamol 500mg | 5 | 20 |
| 2 | Ibuprofeno 400mg | 8 | 15 |
```

### Resumen Diario:
```
📊 Resumen Diario - Almacén Lurín

Estado del Inventario:
- Total Productos: 45
- Stock Bajo: 3
- Por Vencer: 2
- Vencidos: 1

Top 5 - Stock Bajo:
• Paracetamol 500mg - Stock: 5/20
• Ibuprofeno 400mg - Stock: 8/15
```

---

## ✅ Checklist de Implementación

- [ ] Crear `alertasService.js`
- [ ] Modificar `notificaciones.js` (importar servicio)
- [ ] Modificar `app.js` (inicializar servicio)
- [ ] Instalar `node-cron`
- [ ] Reiniciar backend
- [ ] Configurar preferencias desde frontend
- [ ] Esperar 1 hora y verificar emails
- [ ] (Opcional) Probar con datos de prueba

---

¡Ahora tu sistema enviará alertas automáticamente! 🎉
