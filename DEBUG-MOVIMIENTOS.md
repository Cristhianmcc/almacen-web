# 🐛 DEBUG: Error de Validación en Movimientos

## Problema Actual
Error 400 (Bad Request) al intentar registrar entrada/salida de stock.

## 🔍 Pasos para Diagnosticar

### 1. Verificar Logs en Consola (F12)

Después de intentar registrar un movimiento, buscar en la consola:

```javascript
[Movimientos] Datos del formulario: {
  product_id: "1",
  quantity: 15,
  reason: "nuevitop",
  expiry_date: "2025-12-28"
}

[API] POST Request: {
  endpoint: "/movements/entry",
  originalData: {...}
}

[API] Movimiento transformado para backend: {
  producto_id: 1,
  cantidad: 15,
  fecha_vencimiento: "2025-12-28"
}

[API] POST Error completo: {
  status: 400,
  statusText: "Bad Request",
  errorData: {...}  // ESTE ES EL MÁS IMPORTANTE
}
```

### 2. Posibles Causas del Error 400

#### A) Campos requeridos faltantes
El backend puede requerir campos adicionales que no estamos enviando:
- ✅ `producto_id` - enviamos
- ✅ `cantidad` - enviamos
- ❓ `usuario` - ¿requerido?
- ❓ `fecha_movimiento` - ¿requerido?
- ❓ `destino` - ¿requerido?

#### B) Formato de fecha incorrecto
```javascript
// Frontend envía: "2025-12-28"
// Backend espera: "2025-12-28T00:00:00.000Z" ???
```

#### C) Validación del backend
- Cantidad debe ser > 0 ✅
- Producto debe existir ✅
- Stock suficiente para salidas ❓

### 3. Soluciones a Probar

#### Solución 1: Agregar campos opcionales
```javascript
_transformMovementToBackend(movement) {
  const backendMovement = {
    producto_id: Number(movement.product_id),
    cantidad: Number(movement.quantity),
    usuario: 'admin', // Por defecto
    fecha_movimiento: new Date().toISOString()
  }
  
  if (movement.reason && movement.reason.trim()) {
    backendMovement.motivo = movement.reason.trim()
  }
  
  if (movement.type === 'entrada' && movement.expiry_date) {
    backendMovement.fecha_vencimiento = movement.expiry_date
  }
  
  return backendMovement
}
```

#### Solución 2: Formatear fecha correctamente
```javascript
if (movement.expiry_date) {
  // Convertir YYYY-MM-DD a ISO 8601
  backendMovement.fecha_vencimiento = new Date(movement.expiry_date).toISOString()
}
```

#### Solución 3: No transformar (usar endpoint directo)
```javascript
// En Movimientos.jsx, enviar directamente en formato backend
const dataToSend = {
  producto_id: Number(formData.product_id),
  cantidad: Number(formData.quantity),
  motivo: formData.reason || '',
  usuario: 'admin'
}

if (tipoMovimiento === 'entrada' && formData.expiry_date) {
  dataToSend.fecha_vencimiento = formData.expiry_date
}
```

## 🎯 Acción Inmediata

**IMPORTANTE**: Necesito ver el error COMPLETO del backend para saber exactamente qué está fallando.

### Pasos:
1. Abre DevTools (F12)
2. Ve a la pestaña "Console"
3. Limpia la consola (icono 🚫)
4. Intenta registrar una entrada
5. **COPIA TODO EL TEXTO** que aparece en rojo
6. Pégalo aquí

El error debería verse así:
```
[API] POST Error completo: {
  endpoint: "/movements/entry",
  requestData: {...},
  status: 400,
  statusText: "Bad Request",
  errorData: {
    success: false,
    error: "ESTE MENSAJE ES CLAVE",  ← Necesito ver esto
    details: {...}
  }
}
```

---

## 📝 Información del Sistema

- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Supabase
- **Endpoint**: `POST /movements/entry` y `POST /movements/exit`
- **Archivos modificados**:
  - ✅ `src/services/api.js` - Transformación agregada
  - ✅ `src/pages/Movimientos.jsx` - Logging mejorado

---

**Fecha**: 28 de octubre, 2025  
**Estado**: 🔴 En investigación  
**Siguiente paso**: Obtener error completo del backend
