# 🧪 Guía de Pruebas - Sistema de Notificaciones

## ✅ Cómo Probar que Funciona (SIN Backend Real)

El sistema incluye un **servicio MOCK** que simula el backend. Puedes probar toda la funcionalidad **ahora mismo** sin necesidad de implementar el backend.

---

## 📋 Pasos para Probar

### 1. **Acceder a la Página de Notificaciones**

```
1. Abre la aplicación: http://localhost:3000/
2. Inicia sesión
3. Click en "📧 Notificaciones" en el menú lateral
```

### 2. **Configurar tu Email**

```
1. Ingresa tu email (ej: tu@email.com)
2. Deja las alertas activadas por defecto
3. Click en "💾 Guardar Configuración"
```

**¿Qué debería pasar?**
- ✅ Mensaje: "✅ Preferencias guardadas correctamente"
- ✅ En consola: `🔧 [NOTIFICACIONES] Usando servicio MOCK`
- ✅ En consola: `✅ [MOCK] Preferencias guardadas correctamente`

### 3. **Probar Envío de Email**

```
1. Con tu email configurado
2. Click en "🧪 Enviar Email de Prueba"
3. Espera 1-2 segundos
```

**¿Qué debería pasar?**
- ✅ Mensaje: "✅ Email de prueba enviado. Revisa tu bandeja de entrada."
- ✅ En consola del navegador verás:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL ENVIADO (SIMULACIÓN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 Para: tu@email.com
📋 Tipo: test
🕐 Fecha: 29/10/2025 10:30:15
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 ¡Prueba Exitosa!

Este es un email de prueba del sistema de notificaciones...
```

### 4. **Verificar que se Guardó la Configuración**

```
1. Recarga la página (F5)
2. Vuelve a "📧 Notificaciones"
```

**¿Qué debería pasar?**
- ✅ El formulario se llena automáticamente con tus datos guardados
- ✅ Switches mantienen su estado
- ✅ En consola: `✅ [MOCK] Preferencias obtenidas`

---

## 🔍 Inspeccionar en la Consola del Navegador

### Abrir Consola:
- **Chrome/Edge**: F12 → pestaña "Console"
- **Firefox**: F12 → pestaña "Consola"

### Comandos útiles:

```javascript
// Ver preferencias guardadas
JSON.parse(localStorage.getItem('notification_preferences_mock'))

// Ver log de notificaciones enviadas
JSON.parse(localStorage.getItem('notifications_log_mock'))

// Limpiar todo y empezar de nuevo
localStorage.clear()
```

---

## 🎯 Escenarios de Prueba

### ✅ Escenario 1: Configuración Básica

```
Pasos:
1. Ingresa email: test@example.com
2. Activa todas las alertas
3. Selecciona hora: 08:00
4. Umbral: 7 días
5. Guardar

Resultado esperado:
✅ Mensaje de éxito
✅ Datos guardados en localStorage
```

### ✅ Escenario 2: Desactivar Notificaciones

```
Pasos:
1. Toggle "Estado de Notificaciones" → OFF
2. Guardar

Resultado esperado:
✅ Toggle muestra "Notificaciones Deshabilitadas ❌"
✅ Datos guardados con habilitado: false
```

### ✅ Escenario 3: Cambiar Umbral de Días

```
Pasos:
1. Cambiar "Días de anticipación" a 15 días
2. Guardar

Resultado esperado:
✅ Texto actualiza: "Productos que vencen en los próximos 15 días"
✅ umbralDias guardado como 15
```

### ✅ Escenario 4: Email de Prueba

```
Pasos:
1. Configurar email
2. Click "Enviar Email de Prueba"
3. Abrir consola del navegador

Resultado esperado:
✅ Mensaje "Email de prueba enviado"
✅ En consola: Email formateado con tu email
✅ En log: entrada con tipo "test"
```

### ✅ Escenario 5: Validación de Email

```
Pasos:
1. Ingresa email inválido: "test@com"
2. Guardar

Resultado esperado:
❌ Mensaje: "❌ Email inválido"
❌ No se guarda
```

### ✅ Escenario 6: Campo Vacío

```
Pasos:
1. Dejar email vacío
2. Guardar

Resultado esperado:
❌ Mensaje: "❌ Por favor ingresa tu email"
❌ No se guarda
```

---

## 📊 Ver Estado del Sistema

### En JavaScript Console:

```javascript
// 1. Ver servicio activo
console.log('Mock habilitado:', import.meta.env.VITE_USE_MOCK_NOTIFICATIONS !== 'false')

// 2. Ver preferencias actuales
const prefs = JSON.parse(localStorage.getItem('notification_preferences_mock'))
console.table(prefs)

// 3. Ver historial de emails
const log = JSON.parse(localStorage.getItem('notifications_log_mock')) || []
console.table(log)

// 4. Contar emails enviados
console.log('Total emails enviados:', log.length)
```

---

## 🎬 Video Tutorial (Pasos)

### Grabación de Pantalla Recomendada:

```
1. Mostrar menú lateral con "Notificaciones"
2. Click en Notificaciones
3. Llenar formulario
4. Guardar
5. Probar email (mostrar consola)
6. Recargar página
7. Verificar que se mantiene la config
8. Cambiar configuración
9. Guardar de nuevo
10. Mostrar localStorage en consola
```

---

## 🐛 Troubleshooting

### Problema: No aparece mensaje de éxito

**Solución:**
```javascript
// Verificar en consola:
console.log(localStorage.getItem('notification_preferences_mock'))

// Si es null, intenta guardar manualmente:
localStorage.setItem('notification_preferences_mock', JSON.stringify({
  email: 'test@test.com',
  habilitado: true
}))
```

### Problema: Email de prueba no se "envía"

**Solución:**
```javascript
// Verificar mock activo:
import.meta.env.VITE_USE_MOCK_NOTIFICATIONS !== 'false' // debe ser true

// Si hay error, revisa la consola
```

### Problema: Configuración no se mantiene al recargar

**Solución:**
```javascript
// Verificar permisos de localStorage
try {
  localStorage.setItem('test', '1')
  localStorage.removeItem('test')
  console.log('✅ localStorage funciona')
} catch(e) {
  console.error('❌ localStorage bloqueado:', e)
}
```

---

## 🎯 Checklist de Pruebas Completas

- [ ] **Abrir página de notificaciones**
  - [ ] Carga sin errores
  - [ ] Todos los campos visibles
  - [ ] Botones funcionan

- [ ] **Guardar preferencias**
  - [ ] Con email válido → éxito
  - [ ] Con email inválido → error
  - [ ] Sin email → error
  - [ ] Mensaje de éxito aparece
  - [ ] Consola muestra logs

- [ ] **Email de prueba**
  - [ ] Botón habilitado solo con email
  - [ ] Click envía "email"
  - [ ] Consola muestra email formateado
  - [ ] Mensaje de éxito aparece

- [ ] **Persistencia**
  - [ ] Recargar mantiene config
  - [ ] localStorage tiene datos
  - [ ] Cambios se reflejan

- [ ] **Switches/Toggles**
  - [ ] Toggle notificaciones funciona
  - [ ] Toggles de alertas funcionan
  - [ ] Estados se guardan

- [ ] **Selectores**
  - [ ] Hora se puede cambiar
  - [ ] Días se pueden cambiar
  - [ ] Valores se guardan

- [ ] **Responsive**
  - [ ] Desktop (>1024px) se ve bien
  - [ ] Tablet (768px) se ve bien
  - [ ] Mobile (480px) se ve bien

---

## 🚀 Siguiente Paso: Backend Real

Una vez que hayas probado todo y funcione correctamente en MOCK:

1. **Implementar endpoints del backend** (ver `NOTIFICACIONES-BACKEND.md`)
2. **Crear cuenta en Resend** y obtener API Key
3. **Desactivar MOCK** creando `.env`:
   ```
   VITE_USE_MOCK_NOTIFICATIONS=false
   ```
4. **Probar con backend real**

---

## 💡 Tips

1. **Mantén la consola abierta** mientras pruebas para ver todos los logs
2. **Prueba en diferentes navegadores** (Chrome, Firefox, Edge)
3. **Prueba en móvil** para verificar responsive
4. **Limpia localStorage** entre pruebas para simular usuario nuevo
5. **Toma screenshots** de cada paso para documentación

---

**Fecha:** 29 de Octubre, 2025  
**Versión:** 1.0  
**Sistema:** Almacén Lurín - Modo MOCK Activo ✅
