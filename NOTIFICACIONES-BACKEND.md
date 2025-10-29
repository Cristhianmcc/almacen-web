# 📧 Sistema de Notificaciones por Email - Backend

Este documento explica cómo implementar el sistema de notificaciones por email en el backend usando **Resend** y **Supabase Edge Functions**.

## 📋 Tabla de Contenidos

1. [Configuración de Resend](#configuración-de-resend)
2. [Estructura de Base de Datos](#estructura-de-base-de-datos)
3. [Implementación del Backend](#implementación-del-backend)
4. [Edge Functions de Supabase](#edge-functions-de-supabase)
5. [CRON Jobs](#cron-jobs)
6. [Plantillas de Email](#plantillas-de-email)

---

## 🚀 Configuración de Resend

### Paso 1: Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita (3,000 emails/mes)
3. Verifica tu email

### Paso 2: Obtener API Key

```bash
# En el dashboard de Resend:
1. Ve a "API Keys"
2. Click en "Create API Key"
3. Dale un nombre: "almacen-web"
4. Copia la API Key (solo se muestra una vez)
```

### Paso 3: Configurar dominio (opcional pero recomendado)

```bash
# Para mejor deliverability:
1. Ve a "Domains" en Resend
2. Click "Add Domain"
3. Agrega tu dominio (ej: tu-dominio.com)
4. Configura los registros DNS (SPF, DKIM, DMARC)
5. Verifica el dominio

# Si no tienes dominio, puedes usar: onboarding@resend.dev
```

---

## 🗄️ Estructura de Base de Datos

### Tabla de Preferencias de Notificaciones

```sql
-- Crear tabla de preferencias de notificaciones
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  habilitado BOOLEAN DEFAULT true,
  hora_envio TIME DEFAULT '08:00:00',
  umbral_dias INTEGER DEFAULT 7,
  alerta_stock_bajo BOOLEAN DEFAULT true,
  alerta_vencimiento_proximo BOOLEAN DEFAULT true,
  alerta_vencidos BOOLEAN DEFAULT true,
  alerta_resumen_diario BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_email ON notification_preferences(email);
```

### Tabla de Historial de Notificaciones

```sql
-- Crear tabla de historial de notificaciones enviadas
CREATE TABLE IF NOT EXISTS notifications_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'stock_bajo', 'vencimiento_proximo', 'vencido', 'resumen_diario', 'test'
  asunto VARCHAR(255) NOT NULL,
  estado VARCHAR(20) DEFAULT 'enviado', -- 'enviado', 'error', 'pendiente'
  productos_afectados INTEGER DEFAULT 0,
  error_message TEXT,
  resend_id VARCHAR(255), -- ID de la respuesta de Resend
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_log_user_id ON notifications_log(user_id);
CREATE INDEX idx_notifications_log_email ON notifications_log(email);
CREATE INDEX idx_notifications_log_tipo ON notifications_log(tipo);
CREATE INDEX idx_notifications_log_created_at ON notifications_log(created_at);
```

---

## 🔧 Implementación del Backend

### API Endpoints Necesarios

```javascript
// routes/notificaciones.js
const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Guardar preferencias de notificaciones
router.post('/notificaciones/preferencias', async (req, res) => {
  try {
    const { 
      email, 
      habilitado, 
      hora_envio, 
      alertas, 
      umbral_dias 
    } = req.body;

    const userId = req.user.id; // Obtener de token JWT

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        email,
        habilitado,
        hora_envio,
        umbral_dias,
        alerta_stock_bajo: alertas.stock_bajo,
        alerta_vencimiento_proximo: alertas.vencimiento_proximo,
        alerta_vencidos: alertas.vencidos,
        alerta_resumen_diario: alertas.resumen_diario,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al guardar preferencias:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Obtener preferencias
router.get('/notificaciones/preferencias', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json(data || null);
  } catch (error) {
    console.error('Error al obtener preferencias:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Enviar email de prueba
router.post('/notificaciones/test', async (req, res) => {
  try {
    const { email } = req.body;

    const { data, error } = await resend.emails.send({
      from: 'Almacén Lurín <onboarding@resend.dev>', // Cambia por tu dominio
      to: [email],
      subject: '✅ Email de Prueba - Sistema de Notificaciones',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">🎉 ¡Prueba Exitosa!</h2>
          <p>Este es un email de prueba del sistema de notificaciones de <strong>Almacén Lurín</strong>.</p>
          <p>Si recibiste este mensaje, significa que tu configuración está correcta y empezarás a recibir alertas automáticas sobre:</p>
          <ul>
            <li>📉 Productos con stock bajo</li>
            <li>⏰ Productos próximos a vencer</li>
            <li>❌ Productos vencidos</li>
            <li>📊 Resumen diario del inventario</li>
          </ul>
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">
            Este es un mensaje automático, por favor no responder.
          </p>
        </div>
      `
    });

    if (error) throw error;

    // Guardar en log
    await supabase
      .from('notifications_log')
      .insert({
        user_id: req.user.id,
        email,
        tipo: 'test',
        asunto: 'Email de Prueba',
        estado: 'enviado',
        resend_id: data.id
      });

    res.json({ success: true, message: 'Email de prueba enviado', data });
  } catch (error) {
    console.error('Error al enviar email de prueba:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Enviar notificación (usado por Edge Function y manualmente)
router.post('/notificaciones/enviar', async (req, res) => {
  try {
    const { email, tipo, asunto, mensaje, productos } = req.body;

    // Generar HTML del email según el tipo
    const html = generarHTMLEmail(tipo, productos);

    const { data, error } = await resend.emails.send({
      from: 'Almacén Lurín <onboarding@resend.dev>',
      to: [email],
      subject: asunto,
      html
    });

    if (error) throw error;

    // Guardar en log
    await supabase
      .from('notifications_log')
      .insert({
        user_id: req.user?.id,
        email,
        tipo,
        asunto,
        estado: 'enviado',
        productos_afectados: productos?.length || 0,
        resend_id: data.id
      });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    
    // Guardar error en log
    await supabase
      .from('notifications_log')
      .insert({
        user_id: req.user?.id,
        email: req.body.email,
        tipo: req.body.tipo,
        asunto: req.body.asunto,
        estado: 'error',
        error_message: error.message
      });

    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## ⚡ Edge Functions de Supabase

### Crear Edge Function para enviar alertas diarias

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Crear Edge Function
supabase functions new send-daily-alerts
```

### Código de la Edge Function

```typescript
// supabase/functions/send-daily-alerts/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)

    // 1. Obtener usuarios con notificaciones habilitadas
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('habilitado', true)

    if (!preferences || preferences.length === 0) {
      return new Response(JSON.stringify({ message: 'No hay usuarios con notificaciones habilitadas' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 2. Obtener productos del inventario
    const { data: productos } = await supabase
      .from('products')
      .select('*')

    const results = []

    // 3. Procesar cada usuario
    for (const pref of preferences) {
      const alertas = {
        stockBajo: [],
        proximosVencer: [],
        vencidos: []
      }

      // Detectar productos con stock bajo
      if (pref.alerta_stock_bajo) {
        alertas.stockBajo = productos.filter(p => 
          p.quantity > 0 && p.quantity <= p.min_stock
        )
      }

      // Detectar productos próximos a vencer
      if (pref.alerta_vencimiento_proximo) {
        const hoy = new Date()
        const limite = new Date()
        limite.setDate(hoy.getDate() + pref.umbral_dias)

        alertas.proximosVencer = productos.filter(p => {
          if (!p.expiry_date || p.status === 'vencido') return false
          const fechaVencimiento = new Date(p.expiry_date)
          return fechaVencimiento > hoy && fechaVencimiento <= limite
        })
      }

      // Detectar productos vencidos
      if (pref.alerta_vencidos) {
        const hoy = new Date()
        alertas.vencidos = productos.filter(p => {
          if (!p.expiry_date) return false
          const fechaVencimiento = new Date(p.expiry_date)
          return fechaVencimiento < hoy || p.status === 'vencido'
        })
      }

      const totalAlertas = alertas.stockBajo.length + alertas.proximosVencer.length + alertas.vencidos.length

      // Solo enviar si hay alertas
      if (totalAlertas > 0 || pref.alerta_resumen_diario) {
        const html = generarHTMLResumenDiario(alertas)
        
        // Enviar email con Resend
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Almacén Lurín <onboarding@resend.dev>',
            to: [pref.email],
            subject: `📊 Resumen Diario - ${totalAlertas} Alertas`,
            html
          })
        })

        const resendData = await resendResponse.json()

        // Guardar en log
        await supabase
          .from('notifications_log')
          .insert({
            user_id: pref.user_id,
            email: pref.email,
            tipo: 'resumen_diario',
            asunto: `Resumen Diario - ${totalAlertas} Alertas`,
            estado: resendResponse.ok ? 'enviado' : 'error',
            productos_afectados: totalAlertas,
            resend_id: resendData.id,
            error_message: resendResponse.ok ? null : JSON.stringify(resendData)
          })

        results.push({ 
          email: pref.email, 
          success: resendResponse.ok,
          alertas: totalAlertas
        })
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: results.length,
      results 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

function generarHTMLResumenDiario(alertas: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px;">
        📊 Resumen Diario del Inventario
      </h2>
      
      ${alertas.stockBajo.length > 0 ? `
        <div style="margin: 20px 0; padding: 15px; background: #fee2e2; border-left: 4px solid #dc2626; border-radius: 8px;">
          <h3 style="color: #dc2626; margin-top: 0;">📉 Stock Bajo (${alertas.stockBajo.length})</h3>
          <ul>
            ${alertas.stockBajo.map(p => `
              <li><strong>${p.name}</strong> - Stock: ${p.quantity} (Mínimo: ${p.min_stock})</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${alertas.proximosVencer.length > 0 ? `
        <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
          <h3 style="color: #d97706; margin-top: 0;">⏰ Próximos a Vencer (${alertas.proximosVencer.length})</h3>
          <ul>
            ${alertas.proximosVencer.map(p => `
              <li><strong>${p.name}</strong> - Vence: ${new Date(p.expiry_date).toLocaleDateString('es-PE')}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${alertas.vencidos.length > 0 ? `
        <div style="margin: 20px 0; padding: 15px; background: #ffe4e6; border-left: 4px solid #be123c; border-radius: 8px;">
          <h3 style="color: #be123c; margin-top: 0;">❌ Vencidos (${alertas.vencidos.length})</h3>
          <ul>
            ${alertas.vencidos.map(p => `
              <li><strong>${p.name}</strong> - Venció: ${new Date(p.expiry_date).toLocaleDateString('es-PE')}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      
      <p style="color: #6b7280; font-size: 0.875rem; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
        Este es un mensaje automático del Sistema de Almacén Lurín.<br>
        Para cambiar tus preferencias de notificación, accede a la configuración en la aplicación.
      </p>
    </div>
  `
}
```

### Desplegar Edge Function

```bash
# Configurar secrets
supabase secrets set RESEND_API_KEY=tu_api_key_aqui

# Desplegar
supabase functions deploy send-daily-alerts
```

---

## ⏰ CRON Jobs

### Configurar CRON Job en Supabase

```sql
-- Habilitar extensión pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar ejecución diaria a las 8:00 AM
SELECT cron.schedule(
  'daily-inventory-alerts',
  '0 8 * * *', -- Cron expression: minuto hora día mes día_semana
  $$
  SELECT
    net.http_post(
      url:='https://tu-proyecto.supabase.co/functions/v1/send-daily-alerts',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer tu_anon_key"}'::jsonb
    ) AS request_id;
  $$
);

-- Ver CRON jobs activos
SELECT * FROM cron.job;

-- Desactivar CRON job
SELECT cron.unschedule('daily-inventory-alerts');
```

---

## 📧 Plantillas de Email

### Variables de Entorno

```bash
# .env en el backend
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev  # O tu dominio verificado
FROM_NAME=Almacén Lurín
```

---

## ✅ Checklist de Implementación

- [ ] Crear cuenta en Resend y obtener API Key
- [ ] Crear tablas en Supabase (notification_preferences, notifications_log)
- [ ] Implementar endpoints en el backend (/preferencias, /enviar, /test)
- [ ] Crear Edge Function send-daily-alerts
- [ ] Configurar secrets en Supabase (RESEND_API_KEY)
- [ ] Desplegar Edge Function
- [ ] Configurar CRON job para ejecución diaria
- [ ] Probar email de prueba desde el frontend
- [ ] Verificar recepción de emails (revisar spam)
- [ ] Opcional: Verificar dominio propio en Resend

---

## 🔗 Enlaces Útiles

- [Resend Documentation](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)

---

## 🐛 Troubleshooting

### Los emails llegan a spam

1. Verifica tu dominio en Resend
2. Configura SPF, DKIM y DMARC
3. Evita palabras como "FREE", "URGENT" en el asunto
4. Incluye texto plano además de HTML

### CRON job no se ejecuta

```sql
-- Ver logs de CRON
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-inventory-alerts')
ORDER BY start_time DESC 
LIMIT 10;
```

### Edge Function falla

```bash
# Ver logs
supabase functions logs send-daily-alerts
```

---

**Fecha:** Octubre 2025  
**Autor:** Sistema Almacén Lurín  
**Versión:** 1.0
