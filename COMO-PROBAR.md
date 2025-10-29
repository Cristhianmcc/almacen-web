# 🎯 CÓMO PROBAR LAS NOTIFICACIONES - GUÍA RÁPIDA

## ✅ TODO ESTÁ LISTO - PRUEBA AHORA MISMO

### 🚀 Paso 1: Abrir la Aplicación

```
URL: http://localhost:3000/
```

El servidor ya está corriendo ✅

---

### 📧 Paso 2: Ir a Notificaciones

1. **Inicia sesión** (si no lo has hecho)
2. En el menú lateral, busca el nuevo ítem: **📧 Notificaciones**
3. **Click** en él

![Menú](./docs/menu-notificaciones.png)

---

### 📝 Paso 3: Configurar tu Email

En la página de Notificaciones verás:

```
┌──────────────────────────────────────┐
│ 📧 Configuración de Notificaciones   │
├──────────────────────────────────────┤
│                                      │
│ 📬 Email de Notificaciones           │
│ ┌──────────────────────────────┐     │
│ │ tu@email.com                 │     │
│ └──────────────────────────────┘     │
│                                      │
│ [🧪 Enviar Email de Prueba]         │
│                                      │
│ ○──────● Notificaciones Habilitadas │
│                                      │
│ Tipos de Alertas:                   │
│ ✅ 📉 Stock Bajo                     │
│ ✅ ⏰ Próximos a Vencer              │
│ ✅ ❌ Productos Vencidos             │
│ ⬜ 📊 Resumen Diario                │
│                                      │
│     [💾 Guardar Configuración]      │
└──────────────────────────────────────┘
```

**Haz esto:**
1. Escribe tu email (cualquier email válido, ej: `test@test.com`)
2. Click **"💾 Guardar Configuración"**

---

### ✅ Paso 4: Verificar que Funcionó

**Deberías ver:**
- ✅ Mensaje verde: "✅ Preferencias guardadas correctamente"

**Abre la consola del navegador (F12):**
- ✅ Verás: `🔧 [NOTIFICACIONES] Usando servicio MOCK`
- ✅ Verás: `✅ [MOCK] Preferencias guardadas correctamente`

---

### 🧪 Paso 5: Probar Email de Prueba

1. Click en **"🧪 Enviar Email de Prueba"**
2. Espera 1-2 segundos

**Deberías ver:**
- ✅ Mensaje verde: "✅ Email de prueba enviado. Revisa tu bandeja de entrada."

**En la consola verás algo como:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL ENVIADO (SIMULACIÓN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 Para: test@test.com
📋 Tipo: test
🕐 Fecha: 29/10/2025 11:00:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 ¡Prueba Exitosa!

Este es un email de prueba del sistema de notificaciones
de Almacén Lurín.

Si recibiste este mensaje, significa que tu configuración
está correcta...
```

---

## 🎬 Demo en Video (Grábalo así)

### Secuencia recomendada:

```
1. Mostrar navegador en http://localhost:3000
2. Login
3. Click en menú "📧 Notificaciones"
4. Llenar email: demo@test.com
5. Click "Guardar" → mostrar mensaje de éxito
6. Abrir F12 (consola)
7. Click "Enviar Email de Prueba"
8. Mostrar en consola el "email enviado"
9. Recargar página (F5)
10. Volver a Notificaciones
11. Mostrar que se mantiene la config
12. En consola: localStorage.getItem('notification_preferences_mock')
13. Mostrar el JSON guardado
```

**Duración:** 2-3 minutos

---

## 🔍 Comandos para la Consola

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver preferencias guardadas
console.table(JSON.parse(localStorage.getItem('notification_preferences_mock')))

// Ver log de emails "enviados"
console.table(JSON.parse(localStorage.getItem('notifications_log_mock')))

// Limpiar todo (empezar de nuevo)
localStorage.clear()
location.reload()
```

---

## 💡 Lo que está pasando detrás de escena

Cuando haces click en "Guardar" o "Enviar Email":

```
Frontend                   Mock Service              localStorage
   │                            │                         │
   │── guardarPreferencias() ──▶│                         │
   │                            │── Simula 800ms delay ───│
   │                            │                         │
   │                            │── JSON.stringify() ────▶│
   │                            │                         │
   │◀─── { success: true } ─────│                         │
   │                            │                         │
   │── Muestra mensaje ✅       │                         │
```

**TODO ES LOCAL** - No necesitas backend todavía 🎉

---

## 🎯 Checklist de Prueba Rápida

Marca cada uno cuando lo pruebes:

- [ ] ✅ La página de Notificaciones carga
- [ ] ✅ Puedo escribir un email
- [ ] ✅ Click "Guardar" muestra mensaje verde
- [ ] ✅ Click "Email de Prueba" muestra mensaje verde
- [ ] ✅ En consola veo "🔧 [NOTIFICACIONES] Usando servicio MOCK"
- [ ] ✅ En consola veo el email formateado
- [ ] ✅ Al recargar, la config se mantiene
- [ ] ✅ Puedo cambiar switches y se guardan
- [ ] ✅ Puedo cambiar hora y días

---

## 🎨 Capturas de Pantalla Recomendadas

Toma screenshots de:

1. **Menú lateral** con "📧 Notificaciones" visible
2. **Formulario completo** con todos los campos
3. **Mensaje de éxito** al guardar
4. **Mensaje de éxito** al enviar email de prueba
5. **Consola del navegador** mostrando el email simulado
6. **localStorage** con el JSON guardado
7. **Versión móvil** (responsive)

---

## 🚀 Próximos Pasos

### Cuando ya probaste todo:

1. ✅ **Funciona en MOCK** (estás aquí)
2. ⏳ **Implementar Backend Real**
   - Crear cuenta en Resend
   - Crear endpoints API
   - Crear Edge Functions
3. ⏳ **Desactivar Mock**
   - Crear `.env` con `VITE_USE_MOCK_NOTIFICATIONS=false`
4. ⏳ **Probar con Emails Reales**
   - Recibir emails en tu bandeja

---

## 📞 ¿Problemas?

### Si no funciona algo:

1. **Recarga la página** (Ctrl + F5)
2. **Abre consola** (F12) y busca errores en rojo
3. **Limpia localStorage**: `localStorage.clear()` en consola
4. **Reinicia el servidor**: Ctrl+C en terminal, luego `npm run dev`

---

## 🎉 ¡Listo para Probar!

**TODO ESTÁ CONFIGURADO**

Solo tienes que:
1. Ir a http://localhost:3000/
2. Click en "📧 Notificaciones"
3. Probar los botones
4. Ver la consola

**¡Es así de fácil!** 🚀

---

**Estado:** ✅ LISTO PARA PROBAR  
**Fecha:** 29 de Octubre, 2025  
**Servidor:** http://localhost:3000/  
**Modo:** MOCK (sin backend)
