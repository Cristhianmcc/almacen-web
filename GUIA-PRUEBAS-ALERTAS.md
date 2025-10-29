# 🧪 Guía de Pruebas - Sistema de Alertas Automáticas

## ✅ Estado Actual

### Cambios Implementados:
1. ✅ Frontend: Mensaje mejorado al guardar preferencias
2. ✅ Backend: Verificación inmediata después de movimientos
3. ✅ Backend: Endpoint de debug para verificar preferencias
4. ✅ Backend: Método `verificarAlertasInmediatas()` agregado

---

## 🔍 Paso 1: Verificar que el Backend está Actualizado

### 1.1 Reiniciar el Backend
```bash
cd c:\Users\Cris\Desktop\almacen-instituto
# Presiona Ctrl+C para detener el backend actual
npm run start
```

### 1.2 Buscar estos mensajes en la consola:
```
✅ Rutas cargadas exitosamente
🔔 Inicializando servicio de alertas automáticas...
✅ Servicio de alertas iniciado correctamente
   - Verificación cada hora
   - Resumen diario según configuración
🚀 Servidor corriendo en puerto 3003
```

Si ves estos mensajes, el backend está listo. ✅

---

## 🔍 Paso 2: Guardar las Preferencias de Notificaciones

### 2.1 Ir a Notificaciones
1. Abre http://localhost:3000/notificaciones
2. Verás tu email: `elcapomlc01@gmail.com`
3. Asegúrate que **Notificaciones Habilitadas** esté activado (toggle azul)
4. Activa **Productos con stock bajo** ✅
5. Haz clic en **"Guardar Configuración"**

### 2.2 Mensaje Esperado
Deberías ver un mensaje detallado como:
```
✅ ¡Configuración guardada exitosamente!

📧 Email registrado: elcapomlc01@gmail.com
🔔 Alertas activas: Stock Bajo, Vencimiento Próximo...
⏰ Resumen diario: 08:00
📅 Anticipación: 7 días

Las alertas se enviarán automáticamente...
```

### 2.3 Verificar en el Backend
En la consola del backend deberías ver:
```
✅ Preferencias registradas para: elcapomlc01@gmail.com
```

---

## 🔍 Paso 3: Verificar que las Preferencias se Guardaron

### 3.1 Llamar al endpoint de debug
Abre una nueva terminal PowerShell y ejecuta:

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/notificaciones/debug/preferencias" -Method Get | ConvertTo-Json -Depth 5
```

**Resultado esperado:**
```json
{
  "total": 1,
  "preferencias": [
    {
      "email": "elcapomlc01@gmail.com",
      "enabled": true,
      "alertTypes": {
        "stockBajo": true,
        "vencimientoProximo": true,
        "vencidos": true,
        "resumenDiario": false
      },
      "horaEnvio": "08:00",
      "umbralDias": 7
    }
  ]
}
```

Si ves esto, las preferencias están guardadas correctamente. ✅

---

## 🔍 Paso 4: Crear Producto con Stock Bajo

### 4.1 Ir a Productos
1. Abre http://localhost:3000/productos
2. Haz clic en **"+ Nuevo Producto"**

### 4.2 Llenar el formulario:
- **Código**: TEST001
- **Nombre**: Producto de Prueba
- **Marca**: Test
- **Unidad de Medida**: Unidad
- **Stock Actual**: `5` ⚠️ (menor al mínimo)
- **Stock Mínimo**: `20` ⚠️ (mayor al actual)
- **Orden de Compra**: TEST

### 4.3 Guardar el Producto
Haz clic en **"Guardar"**

---

## 🔍 Paso 5: Verificar en el Backend

En la consola del backend deberías ver **INMEDIATAMENTE**:

```
⚡ Verificación inmediata de alertas para 1 usuario(s)...
📧 Enviando alerta de stock bajo inmediata a elcapomlc01@gmail.com
✅ Notificación enviada a elcapomlc01@gmail.com - Tipo: stock_bajo
```

---

## 🔍 Paso 6: Verificar el Email

### 6.1 Revisar tu bandeja de entrada
- Gmail: https://mail.google.com
- Busca email de: `onboarding@resend.dev`
- Asunto: **"⚠️ Alerta: Productos con Stock Bajo"**

### 6.2 Contenido del email
Deberías ver una tabla con:

| # | Producto | Stock Actual | Stock Mínimo |
|---|----------|--------------|--------------|
| 1 | Producto de Prueba | 5 | 20 |

### 6.3 Si no llega el email
1. Revisa la carpeta de **Spam**
2. Espera 1-2 minutos (Resend puede tener delay)
3. Verifica los logs del backend por errores

---

## ❌ Troubleshooting

### Problema 1: "No hay usuarios con notificaciones activas"
**Causa**: Las preferencias no se guardaron
**Solución**: 
1. Ejecuta el endpoint de debug (Paso 3.1)
2. Si está vacío, vuelve a guardar las preferencias
3. Verifica que el backend esté corriendo

### Problema 2: No se ejecuta `verificarAlertasInmediatas`
**Causa**: El backend no se reinició con los cambios
**Solución**:
1. Detén el backend (Ctrl+C)
2. Ejecuta `npm run start`
3. Verifica los logs de inicio

### Problema 3: Error de Resend en el backend
**Causa**: API Key inválida o dominio no verificado
**Solución**:
1. Verifica que el `.env` tenga:
   ```
   RESEND_API_KEY=re_xxxxx
   FROM_EMAIL=onboarding@resend.dev
   FROM_NAME=Almacén Lurín
   ```
2. Reinicia el backend

### Problema 4: El email no llega
**Causas posibles**:
1. **Spam**: Revisa la carpeta de spam
2. **Delay de Resend**: Espera hasta 5 minutos
3. **Límite de Resend**: Verifica en https://resend.com/emails que no excediste el límite

---

## 📊 Verificación Final

### Lista de Verificación:
- [ ] Backend corriendo en puerto 3003
- [ ] Frontend corriendo en puerto 3000
- [ ] Mensaje de inicio del servicio de alertas visible
- [ ] Preferencias guardadas (verificado con endpoint debug)
- [ ] Email: `elcapomlc01@gmail.com` registrado
- [ ] Alerta "Stock Bajo" activada
- [ ] Producto creado con stock 5 < mínimo 20
- [ ] Log de "Verificación inmediata" en el backend
- [ ] Log de "Notificación enviada" en el backend
- [ ] Email recibido en la bandeja

---

## 🎯 Resultado Esperado

**Si todo funciona correctamente:**

1. ✅ Al guardar preferencias → Mensaje detallado en frontend
2. ✅ Al crear producto con stock bajo → Log inmediato en backend
3. ✅ Dentro de 1-2 minutos → Email en tu bandeja
4. ✅ Email con formato HTML bonito y tabla de productos

**Tiempo total**: La alerta debería llegar en menos de 2 minutos después de crear el producto.

---

## 🚀 Próximos Pasos

Una vez que confirmes que funciona:

1. Prueba con otros tipos de alertas (vencimiento, vencidos)
2. Prueba el resumen diario (configura hora actual + 1 minuto)
3. Push a GitHub y deploy en Render
4. Configura las variables de entorno en Render

---

## 📞 Si Necesitas Ayuda

Comparte:
1. Logs completos del backend
2. Respuesta del endpoint debug
3. Screenshot del mensaje en el frontend
4. Cualquier error en la consola del navegador
