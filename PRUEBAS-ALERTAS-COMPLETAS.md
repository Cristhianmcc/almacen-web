# 🧪 Guía Completa de Pruebas de Alertas

## ✅ Estado Actual
- ✅ **Stock Bajo**: FUNCIONANDO (emails llegando)
- 🔄 **Vencimiento Próximo**: Actualizado para usar tabla `productos`
- 🔄 **Vencidos**: Actualizado para usar tabla `productos`
- ⏰ **Resumen Diario**: Configurado para las 8:00 AM

---

## 📊 Datos Detectados en tu Base de Datos

### Productos VENCIDOS (deberían generar alerta):
1. **ID 32** - "Pañal de gamer" - Vencido: 2025-09-24 ❌
2. **ID 22** - "Corbata Michi" - Vencido: 2025-07-30 ❌
3. **ID 14** - "Producto con Vencimiento" - Vencido: 2025-10-26 ❌

### Productos PRÓXIMOS a vencer (< 7 días):
- Ninguno detectado actualmente

### Productos con Stock Bajo (< 50):
1. **ID 38** - "Lentes para ciegos" - Stock: 5 ⚠️
2. **ID 37** - "Plumones" - Stock: 10 ⚠️
3. **ID 36** - "Boxer de Superman" - Stock: 5 ⚠️
4. Y más...

---

## 🧪 Cómo Probar Cada Alerta

### 1️⃣ Stock Bajo (YA FUNCIONA ✅)
**Cómo probar:**
1. Haz una salida de cualquier producto con stock < 50
2. **Recibes email INMEDIATAMENTE**

---

### 2️⃣ Vencimiento Próximo (Actualizado ✅)
**Cómo probar:**

#### Opción A: Esperar el Cron (cada hora)
- Las alertas se verifican automáticamente cada hora
- Si hay productos que vencen en los próximos 7 días, recibirás email

#### Opción B: Crear producto de prueba
1. Ve a tu frontend y crea un nuevo producto
2. Pon como `fecha_vencimiento`: **2025-11-02** (4 días desde hoy)
3. Guarda el producto
4. **Espera a la próxima hora en punto** (ej: si son 19:50, espera hasta las 20:00)
5. Deberías recibir el email de vencimiento próximo

#### Opción C: Forzar verificación manualmente
Crea este archivo en el backend:

**Archivo:** `C:\Users\Cris\Desktop\almacen-instituto\src\routes\notificaciones.js`

Agrega al final del archivo (antes de `module.exports = router;`):

```javascript
// 🧪 ENDPOINT DE PRUEBA - Forzar verificación de alertas
router.post('/forzar-verificacion', async (req, res) => {
  try {
    console.log('🧪 Forzando verificación de alertas...');
    await alertasService.verificarYEnviarAlertas();
    res.json({ 
      success: true, 
      message: 'Verificación forzada completada. Revisa tu email.' 
    });
  } catch (error) {
    console.error('❌ Error al forzar verificación:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

Luego puedes llamarlo desde Postman o curl:
```bash
POST http://localhost:3003/api/notificaciones/forzar-verificacion
```

---

### 3️⃣ Productos Vencidos (Actualizado ✅)

**¡TIENES 3 PRODUCTOS VENCIDOS!** 

Para recibir la alerta:

#### Opción A: Esperar el Cron
- Se verifica automáticamente cada hora
- Si tienes productos vencidos, recibirás email

#### Opción B: Usar el endpoint de prueba
- Agrega el endpoint de arriba y llámalo
- Deberías recibir email inmediatamente con los 3 productos vencidos

---

### 4️⃣ Resumen Diario (Configurado ⏰)

**Se envía automáticamente todos los días a las 8:00 AM**

Incluye:
- Total de productos
- Productos con stock bajo (top 5)
- Productos próximos a vencer (top 5)
- Productos vencidos

**Para probar:**
- Espera hasta mañana a las 8:00 AM
- Recibirás el resumen completo

---

## 🔧 Reiniciar Backend

Después de los cambios realizados:

```bash
cd C:\Users\Cris\Desktop\almacen-instituto
# Ctrl+C para detener
npm run start
```

---

## 📧 Emails que Deberías Recibir

### Email de Stock Bajo (Ya recibes ✅)
```
Asunto: ⚠️ Alerta de Stock Bajo
Contenido: Lista de productos con stock < 50
```

### Email de Vencimiento Próximo
```
Asunto: ⏰ Productos Próximos a Vencer
Contenido: Productos que vencen en los próximos 7 días
```

### Email de Productos Vencidos
```
Asunto: ❌ Productos Vencidos
Contenido: Productos con fecha de vencimiento pasada
```

### Email de Resumen Diario
```
Asunto: 📊 Resumen Diario del Almacén
Contenido: Estadísticas generales del almacén
```

---

## 🐛 Si No Recibes Emails

1. **Verifica que las preferencias estén guardadas:**
   - Ve a Notificaciones
   - Marca las alertas que quieres recibir
   - Guarda

2. **Revisa los logs del backend:**
   - Busca: "📧 Enviando email..."
   - Busca: "✅ Email enviado exitosamente"
   - Si ves errores, cópialos

3. **Verifica la hora del cron:**
   - Las alertas de vencimiento se verifican **cada hora en punto**
   - Si son 19:45, espera hasta las 20:00

4. **Revisa spam/promociones:**
   - Los emails pueden llegar a spam
   - Remitente: onboarding@resend.dev

---

## 🎯 Próximos Pasos

1. ✅ Reinicia el backend con los cambios
2. ✅ Guarda las preferencias en Notificaciones
3. ⏰ Espera la próxima hora en punto
4. 📧 Deberías recibir email de **Productos Vencidos** (tienes 3!)
5. 🧪 Opcionalmente: Agrega el endpoint de prueba para forzar verificación

---

## 📝 Notas Importantes

- **Stock Bajo:** Inmediato ✅
- **Vencimiento/Vencidos:** Cada hora (en punto: 20:00, 21:00, etc.)
- **Resumen Diario:** 8:00 AM todos los días
- **Límite anti-spam:** 1 email cada 24 horas por tipo de alerta
- **Umbral de días:** 7 días (configurable en preferencias)
