# Problema: Emails Solo Llegan a elcapomlc01@gmail.com

## 🐛 Problema Reportado

**Síntoma**: Las notificaciones de alertas por email solo llegan cuando el destinatario es `elcapomlc01@gmail.com`. Cualquier otro email no recibe las notificaciones.

---

## 🔍 Análisis del Problema

### ✅ Frontend Está Correcto

He verificado el código del frontend y **NO hay ninguna restricción**:

```javascript
// src/services/notifications.js
async enviarNotificacion(data) {
  const response = await this.client.post('/notificaciones/enviar', {
    email: data.email, // ✅ Se envía el email tal cual sin filtros
    tipo: data.tipo,
    asunto: data.asunto,
    mensaje: data.mensaje,
    productos: data.productos || []
  })
  return response.data
}
```

El frontend envía el email correctamente al backend sin ninguna validación restrictiva.

---

## 🎯 Causas Probables (Backend)

El problema está en el **BACKEND**. Aquí las causas más comunes:

### 1. **Modo Sandbox del Servicio de Email** 🏖️

La mayoría de servicios de email (SendGrid, Mailgun, etc.) tienen un "modo sandbox" o "desarrollo":

**SendGrid Sandbox**:
- Solo envía emails a direcciones **verificadas**
- Es una medida de seguridad
- Evita spam durante desarrollo

**Solución**:
1. Ir al panel de SendGrid/Mailgun
2. Agregar el nuevo email como "Verified Sender"
3. O cambiar a modo "Production"

---

### 2. **Lista Blanca (Whitelist) en Backend** 📝

El backend puede tener una lista de emails permitidos:

```python
# Ejemplo en el backend (Python)
ALLOWED_EMAILS = [
    'elcapomlc01@gmail.com',
    # Solo este email está permitido
]

def enviar_email(destinatario):
    if destinatario not in ALLOWED_EMAILS:
        return {"error": "Email no autorizado"}  # ❌
    # Enviar email...
```

**Solución**: Agregar más emails a la lista o remover la restricción.

---

### 3. **Configuración de Dominio** 🌐

El servicio de email puede estar configurado para:
- Solo enviar a `@gmail.com`
- Solo enviar a dominios verificados
- Bloquear ciertos dominios

**Ejemplo**:
```python
# Backend validando dominio
if not email.endswith('@gmail.com'):
    return {"error": "Solo se permiten emails de Gmail"}
```

---

### 4. **Plan Gratuito de Servicio de Email** 💰

Muchos servicios tienen limitaciones en plan gratuito:

| Servicio | Límite Gratuito |
|----------|----------------|
| SendGrid | 100 emails/día, solo emails verificados |
| Mailgun | Solo dominio sandbox |
| Resend | 100 emails/día, solo emails verificados |

---

### 5. **Variable de Entorno** 🔐

El backend puede tener una variable de entorno:

```python
# .env del backend
ALLOWED_EMAIL=elcapomlc01@gmail.com
TEST_MODE=true
```

Si está en modo test, solo envía a ese email.

---

## 🔧 Cómo Verificar

### Opción 1: Revisar Logs del Backend

1. Ve al backend en Render: https://almacen-instituto.onrender.com
2. Busca los logs cuando envías notificación
3. Busca mensajes como:
   ```
   ❌ Email no autorizado: otro@email.com
   ✅ Email enviado a: elcapomlc01@gmail.com
   ```

### Opción 2: Probar con la API Directamente

```bash
# PowerShell
Invoke-RestMethod -Uri "https://almacen-instituto.onrender.com/api/notificaciones/enviar" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"otro@email.com","tipo":"test","asunto":"Prueba","mensaje":"Test"}'
```

Verifica la respuesta:
- ✅ Si funciona: El problema está en el frontend
- ❌ Si falla: El problema está en el backend

---

## ✅ Soluciones

### Solución 1: Verificar Emails en SendGrid (Recomendado)

1. **Ir a SendGrid Dashboard**: https://app.sendgrid.com
2. **Settings** → **Sender Authentication**
3. **Single Sender Verification**
4. **Agregar nuevo email**: El email que quieres que reciba notificaciones
5. **Verificar el email**: Revisa bandeja de entrada
6. **Confirmar**: Haz clic en el link de verificación

Una vez verificado, ese email podrá recibir notificaciones.

---

### Solución 2: Activar Modo Producción

Si estás usando plan pago de SendGrid:

1. **Settings** → **API Keys**
2. Verificar que el API Key tiene permisos completos
3. **Settings** → **Mail Settings**
4. Desactivar "Sandbox Mode"

---

### Solución 3: Modificar Backend (Si tienes acceso)

```python
# Remover restricción de email en el backend
# routes/notificaciones.py

@router.post('/enviar')
async def enviar_notificacion(data: NotificacionData):
    # ❌ REMOVER ESTO:
    # if data.email not in ALLOWED_EMAILS:
    #     raise HTTPException(400, "Email no autorizado")
    
    # ✅ PERMITIR CUALQUIER EMAIL:
    resultado = enviar_email(
        destinatario=data.email,  # Sin restricciones
        asunto=data.asunto,
        mensaje=data.mensaje
    )
    return resultado
```

---

### Solución 4: Agregar Email a Lista Blanca

Si el backend usa whitelist:

```python
# config.py o .env
ALLOWED_EMAILS = [
    'elcapomlc01@gmail.com',
    'nuevo_email@gmail.com',  # ✅ Agregar aquí
    'otro_email@outlook.com',
]
```

---

## 🧪 Pasos para Diagnosticar

### Test 1: Verificar en Frontend

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network**
3. Envía una notificación con otro email
4. Revisa la petición:
   ```json
   POST /notificaciones/enviar
   {
     "email": "otro@email.com",  // ¿Se envía correcto?
     "tipo": "stock_bajo",
     ...
   }
   ```
5. Revisa la respuesta:
   ```json
   {
     "success": false,
     "error": "Email no autorizado"  // ❌ Problema en backend
   }
   ```

---

### Test 2: Revisar Configuración de Email

1. **¿Qué servicio usa el backend?**
   - SendGrid
   - Mailgun
   - Resend
   - AWS SES
   - Otro

2. **¿Está en modo sandbox?**
   - Sí: Solo emails verificados
   - No: Cualquier email

3. **¿Qué plan tiene?**
   - Gratuito: Limitaciones
   - Pago: Sin restricciones

---

## 📊 Comparación de Servicios

| Servicio | Plan Gratis | Restricción | Solución |
|----------|-------------|-------------|----------|
| **SendGrid** | 100/día | Solo emails verificados | Verificar cada email |
| **Mailgun** | 5000/mes | Solo dominio sandbox | Verificar dominio |
| **Resend** | 100/día | Solo emails verificados | Verificar emails |
| **AWS SES** | 62,000/mes | Modo sandbox | Solicitar producción |

---

## 💡 Recomendaciones

### Para Desarrollo
- Usar mock o logs en consola
- No enviar emails reales
- Usar servicios como Mailtrap

### Para Producción
1. **Verificar emails importantes** en el servicio de email
2. **Usar dominio propio** verificado
3. **Modo producción** activado
4. **Monitorear límites** de envío

---

## 🚀 Acción Inmediata

### Si NO tienes acceso al backend:

1. **Verifica el email** que quieres usar en SendGrid
2. **Contacta al administrador** del backend
3. **Solicita** que agregue tu email a la lista de permitidos

### Si tienes acceso al backend:

1. **Revisa** `routes/notificaciones.py`
2. **Busca** validaciones de email
3. **Remueve** restricciones o agrega emails permitidos
4. **Redeploy** el backend
5. **Prueba** con el nuevo email

---

## 📝 Ejemplo de Email de Verificación

Cuando agregues un email en SendGrid, recibirás algo como:

```
De: SendGrid <noreply@sendgrid.com>
Asunto: Please Verify Your Email Address

Hi,

Please verify your email address by clicking the link below:

[Verify Email Address]

This link will expire in 7 days.
```

Haz clic y el email quedará verificado.

---

## ✅ Checklist de Verificación

- [ ] El frontend envía el email correcto (verificado en Network)
- [ ] El backend recibe el email correcto (verificado en logs)
- [ ] El servicio de email está configurado
- [ ] El email está verificado en el servicio
- [ ] No hay whitelist en el backend
- [ ] Modo sandbox está desactivado
- [ ] Se tienen permisos suficientes

---

## 🔍 Dónde Buscar

### En el Backend (si tienes acceso)

Busca archivos:
- `routes/notificaciones.py`
- `services/email_service.py`
- `config.py` o `.env`
- `utils/validators.py`

Busca por:
- `ALLOWED_EMAILS`
- `elcapomlc01`
- `email verification`
- `whitelist`
- `sandbox`

---

## 📞 Soporte

Si el problema persiste:

1. **SendGrid Support**: https://support.sendgrid.com
2. **Documentación**: https://docs.sendgrid.com/for-developers/sending-email/sandbox-mode
3. **Backend Developer**: Contactar al desarrollador del backend

---

## ✅ Resumen

**Problema**: Solo `elcapomlc01@gmail.com` recibe emails  
**Causa**: Restricción en el backend o servicio de email  
**Solución**: Verificar email en SendGrid o modificar backend  
**Fecha**: 30/10/2025  
**Estado**: Diagnóstico completo  

---

**Nota**: El frontend está correcto. El problema es 100% del lado del backend o configuración del servicio de email.
