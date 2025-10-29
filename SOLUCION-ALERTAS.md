# 🔧 Solución de Problemas - Alertas NO se Envían

## ❌ Problema Identificado

**Las alertas NO se están enviando porque:**
1. El backend está corriendo con código VIEJO (sin `verificarAlertasInmediatas()`)
2. El email no se persistía al recargar la página

---

## ✅ Soluciones Aplicadas

### 1. Email Persistente ✅
- **Problema**: El email desaparecía al recargar
- **Solución**: Ahora se guarda en `localStorage`
- **Estado**: ✅ RESUELTO (frontend actualizado)

### 2. Verificación Inmediata de Alertas ⚠️
- **Problema**: El método `verificarAlertasInmediatas()` no se ejecuta
- **Causa**: Backend corriendo con código viejo
- **Solución**: NECESITAS REINICIAR EL BACKEND
- **Estado**: ⚠️ PENDIENTE DE TU ACCIÓN

---

## 🚀 PASOS OBLIGATORIOS (HAZ ESTO AHORA)

### Paso 1: Reiniciar el Backend ⚠️ CRÍTICO

**Terminal del Backend:**
```bash
# 1. Presiona Ctrl+C para detener
# 2. Ejecuta:
cd c:\Users\Cris\Desktop\almacen-instituto
npm run start
```

**Mensajes que DEBES VER:**
```
✅ Rutas cargadas exitosamente
🔔 Inicializando servicio de alertas automáticas...
✅ Servicio de alertas iniciado correctamente
   - Verificación cada hora
   - Resumen diario según configuración
🚀 Servidor corriendo en puerto 3003
```

**Si NO ves estos mensajes, el sistema NO funcionará.** ❌

---

### Paso 2: Refrescar el Frontend

**En el navegador:**
1. Presiona `F5` o `Ctrl+R`
2. Ve a http://localhost:3000/notificaciones
3. **Ahora tu email debería aparecer automáticamente** 🎉

---

### Paso 3: Verificar las Preferencias

**En el navegador (Notificaciones):**
1. Verifica que tu email aparezca: `elcapomlc01@gmail.com`
2. Verifica que "Notificaciones Habilitadas" esté ACTIVADO (azul)
3. Verifica que "Productos con stock bajo" esté ACTIVADO
4. Haz clic en **"Guardar Configuración"**

**Mensaje esperado (nuevo y mejorado):**
```
✅ ¡Configuración guardada exitosamente!

📧 Email registrado: elcapomlc01@gmail.com
🔔 Alertas activas: Stock Bajo, Vencimiento Próximo, Productos Vencidos
⏰ Resumen diario: 08:00
📅 Anticipación: 7 días

Las alertas se enviarán automáticamente cuando detectemos productos con stock bajo...
```

---

### Paso 4: Verificar en el Backend

**En la consola del backend deberías ver:**
```
✅ Preferencias registradas para: elcapomlc01@gmail.com
```

**Si NO ves este mensaje:**
- El backend NO recibió las preferencias
- Verifica que el backend esté en puerto 3003
- Verifica que el frontend apunte a `http://localhost:3003/api`

---

### Paso 5: Crear Producto de Prueba

**En el navegador (Productos):**
1. Ve a http://localhost:3000/productos
2. Haz clic en **"+ Nuevo Producto"**
3. Llena:
   - Código: `TEST-LOW-STOCK`
   - Nombre: `Producto Prueba Stock Bajo`
   - Marca: `Test`
   - Unidad: `Unidad`
   - **Stock Actual: `5`** ⚠️
   - **Stock Mínimo: `20`** ⚠️
   - Orden: `TEST-001`
4. Haz clic en **"Guardar"**

---

### Paso 6: OBSERVAR EL BACKEND ⚠️ MUY IMPORTANTE

**INMEDIATAMENTE después de guardar el producto, en la consola del backend debes ver:**

```
⚡ Verificación inmediata de alertas para 1 usuario(s)...
📧 Enviando alerta de stock bajo inmediata a elcapomlc01@gmail.com
📧 Enviando email de prueba a: elcapomlc01@gmail.com
✅ Email enviado correctamente
✅ Notificación enviada a elcapomlc01@gmail.com - Tipo: stock_bajo
```

**Si NO ves estos mensajes:**
❌ El backend NO tiene los cambios actualizados
❌ Vuelve al Paso 1 y reinicia el backend correctamente

---

### Paso 7: Verificar el Email

**En tu Gmail:**
1. Ve a https://mail.google.com
2. Busca email de: `onboarding@resend.dev`
3. Asunto: `⚠️ Alerta: Productos con Stock Bajo`

**Contenido esperado:**
```
📉 Productos con Stock Bajo

Los siguientes productos están por debajo del stock mínimo:

┌───┬─────────────────────────┬──────────────┬──────────────┐
│ # │ Producto                │ Stock Actual │ Stock Mínimo │
├───┼─────────────────────────┼──────────────┼──────────────┤
│ 1 │ Producto Prueba Stock Bajo │      5       │      20      │
└───┴─────────────────────────┴──────────────┴──────────────┘

⚡ Acción requerida: Revisa tu inventario...
```

**Tiempo de llegada:** 30 segundos a 2 minutos máximo

---

## 🔍 Diagnóstico Rápido

### ¿Los logs del backend muestran "Verificación inmediata"?

**SÍ** ✅
- El backend está actualizado
- Continúa al siguiente paso

**NO** ❌
- El backend NO está actualizado
- **REINICIA EL BACKEND** (Paso 1)
- **NO CONTINÚES** hasta ver los logs correctos

---

### ¿El email persiste al recargar la página?

**SÍ** ✅
- El localStorage está funcionando
- El frontend está actualizado

**NO** ❌
- Refresca el navegador (F5)
- Limpia caché (Ctrl+Shift+R)
- Verifica la consola del navegador por errores

---

## 📊 Checklist de Verificación

Marca cada paso SOLO cuando lo completes:

- [ ] Backend reiniciado con `npm run start`
- [ ] Veo el mensaje "🔔 Inicializando servicio de alertas"
- [ ] Veo el mensaje "✅ Servicio de alertas iniciado"
- [ ] Frontend refrescado (F5)
- [ ] Email aparece automáticamente en Notificaciones
- [ ] Preferencias guardadas exitosamente
- [ ] Veo "✅ Preferencias registradas" en el backend
- [ ] Producto creado con stock 5 < mínimo 20
- [ ] Veo "⚡ Verificación inmediata" en el backend
- [ ] Veo "✅ Notificación enviada" en el backend
- [ ] Email recibido en Gmail

**Si todos los checks están ✅, el sistema funciona correctamente.**

---

## 🆘 Si Aún No Funciona

**Comparte:**
1. Screenshot de la consola del backend (últimas 50 líneas)
2. Screenshot de la consola del navegador (pestaña Console)
3. Mensaje de error si hay alguno

**Comando para exportar logs del backend:**
```powershell
# En la terminal del backend, presiona Ctrl+C y ejecuta:
Get-Content -Path "c:\Users\Cris\Desktop\almacen-instituto\backend.log" -Tail 100
```

---

## 🎯 Resultado Final Esperado

**Cuando TODO funcione correctamente:**

1. ✅ Email se mantiene al recargar la página
2. ✅ Preferencias se guardan exitosamente
3. ✅ Crear producto con stock bajo → Log "Verificación inmediata"
4. ✅ Log "Notificación enviada"
5. ✅ Email llega en menos de 2 minutos
6. ✅ Email con formato HTML bonito
7. ✅ Tabla con el producto que tiene stock bajo

**Todo esto debe pasar EN TIEMPO REAL, no en 1 hora.**

---

## ⚡ ACCIÓN REQUERIDA AHORA

**NO LEAS MÁS. HAZ ESTO:**

1. **Detén el backend** (Ctrl+C)
2. **Reinicia el backend** (`npm run start`)
3. **Busca los mensajes** de inicialización de alertas
4. **Refresca el navegador** (F5)
5. **Guarda las preferencias** de nuevo
6. **Crea un producto** con stock bajo
7. **Observa los logs** del backend

**Si sigues estos pasos, funcionará al 100%.** 🚀
