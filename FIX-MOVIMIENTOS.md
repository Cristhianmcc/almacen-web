# FIX: Corrección de Registro de Movimientos

## 🐛 PROBLEMA IDENTIFICADO

Los movimientos (entradas y salidas) fallaban al intentar registrarlos porque:

**Error en el envío de datos:**
```javascript
// ❌ ANTES: Movimientos.jsx enviaba datos en formato frontend
const data = {
  product_id: 123,        // ❌ Backend espera: producto_id
  quantity: 10,           // ❌ Backend espera: cantidad
  reason: "...",          // ❌ Backend espera: motivo
  type: "entrada"         // ❌ Backend espera: tipo_movimiento
}
```

**Resultado:** 
- Error 400 Bad Request o similar
- El backend no reconocía los campos
- Los movimientos no se registraban

## ✅ SOLUCIÓN APLICADA

### 1. Agregada función de transformación en `api.js`

**Archivo modificado:** `src/services/api.js`

```javascript
// Nueva función agregada después de _transformProductToBackend
_transformMovementToBackend(movement) {
  if (!movement) return null
  
  const backendMovement = {
    producto_id: Number(movement.product_id),
    cantidad: Number(movement.quantity),
    motivo: movement.reason || '',
    tipo_movimiento: movement.type || 'entrada'
  }
  
  // Agregar fecha de vencimiento solo para entradas
  if (movement.expiry_date) {
    backendMovement.fecha_vencimiento = movement.expiry_date
  }
  
  console.log('[API] Movimiento transformado para backend:', backendMovement)
  return backendMovement
}
```

### 2. Modificado método POST para transformar movimientos

**En el método `post()` de `api.js`:**

```javascript
async post(endpoint, data) {
  let requestData = data
  try {
    // ... código de productos ...
    
    // ✅ NUEVO: Transformar datos de movimiento antes de enviar
    if (endpoint.includes('/movements') && data) {
      requestData = this._transformMovementToBackend(data)
      console.log('[API] Movimiento transformado para backend:', requestData)
    }
    
    const response = await this.client.post(endpoint, requestData)
    let responseData = response.data?.data || response.data
    
    // ... código de productos ...
    
    // ✅ NUEVO: Transformar respuesta si es un movimiento
    if (endpoint.includes('/movements') && responseData && !Array.isArray(responseData)) {
      responseData = this._transformMovement(responseData)
    }
    
    return { success: true, data: responseData }
  } catch (error) {
    // ... manejo de errores ...
  }
}
```

## 📊 Mapeo de Campos

### Frontend → Backend
```javascript
product_id      → producto_id
quantity        → cantidad  
reason          → motivo
type            → tipo_movimiento
expiry_date     → fecha_vencimiento (solo para entradas)
```

### Backend → Frontend (ya existía)
```javascript
producto_id              → product_id
cantidad                 → quantity
motivo                   → reason
tipo_movimiento          → type
fecha_movimiento         → date
productos.nombre_item    → product_name
productos.codigo_item    → product_code
```

## 🎯 Resultado

### ✅ Ahora funciona correctamente:

1. **Entradas de stock:**
   - Seleccionar producto ✅
   - Ingresar cantidad ✅
   - Fecha de vencimiento (opcional) ✅
   - Motivo (opcional) ✅
   - Se registra correctamente ✅

2. **Salidas de stock:**
   - Seleccionar producto ✅
   - Ingresar cantidad ✅
   - Motivo (opcional) ✅
   - Se registra correctamente ✅

3. **Transformación bidireccional:**
   - Envío: Frontend → Backend ✅
   - Respuesta: Backend → Frontend ✅
   - Logs en consola para debugging ✅

## 🔍 Debugging

Para verificar que funciona, revisar la consola del navegador (F12):

```javascript
// Al enviar un movimiento, deberías ver:
[API] POST /movements/entry
[API] Movimiento transformado para backend: {
  producto_id: 123,
  cantidad: 10,
  motivo: "Compra a proveedor",
  tipo_movimiento: "entrada",
  fecha_vencimiento: "2025-12-31"
}
[API] Response 200: { success: true, data: {...} }
```

## 📝 Notas

- La transformación es **automática** al usar `api.post()`
- El componente `Movimientos.jsx` NO necesita cambios
- El formato frontend se mantiene limpio y consistente
- Compatible con el resto de la aplicación

---

**Fecha del fix:** 28 de octubre, 2025  
**Archivos modificados:** `src/services/api.js`  
**Estado:** ✅ Resuelto completamente
