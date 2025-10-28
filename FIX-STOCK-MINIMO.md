# FIX: Corrección de Alertas de Stock Mínimo

## 🐛 PROBLEMA IDENTIFICADO

Las alertas de stock estaban mostrando incorrectamente productos con stock alto como "ALTO" o "CRÍTICO" porque:

**Error en `src/services/api.js` línea 53:**
```javascript
min_stock: product.mayor, // ❌ INCORRECTO: mayor es el precio mayorista
```

**Resultado:** 
- Pañal de gamer: Stock 1000, pero `mayor` (precio) = 6251 → ❌ Alerta incorrecta
- Pupiletras: Stock 200, pero `mayor` (precio) = 1301 → ❌ Alerta incorrecta

## ✅ SOLUCIÓN APLICADA (TEMPORAL)

**Archivo modificado:** `src/services/api.js`

```javascript
// Línea 53-54
min_stock: product.stock_minimo || 50, // ✅ Stock mínimo por defecto: 50 unidades
```

**Resultado ahora:**
- Si el backend envía `stock_minimo`: Se usa ese valor
- Si no existe el campo: Se usa **50 unidades** como stock mínimo por defecto

**Ventajas:**
- ✅ Las alertas ahora funcionan correctamente
- ✅ No rompe la aplicación actual
- ✅ Compatible con futuras actualizaciones del backend

**Desventajas:**
- ⚠️ Todos los productos usan el mismo stock mínimo (50 unidades)
- ⚠️ No se puede personalizar por producto

## 🎯 SOLUCIÓN DEFINITIVA (RECOMENDADA)

### 1. Agregar campo `stock_minimo` a la base de datos

**Ejecutar en Supabase:**

```sql
-- Agregar columna stock_minimo a la tabla productos
ALTER TABLE productos 
ADD COLUMN stock_minimo INTEGER DEFAULT 50;

-- Agregar comentario
COMMENT ON COLUMN productos.stock_minimo IS 'Cantidad mínima de stock para generar alertas';

-- Índice para mejorar performance de consultas de alertas
CREATE INDEX idx_productos_stock_bajo 
ON productos (stock_actual) 
WHERE stock_actual <= stock_minimo;
```

### 2. Actualizar valores iniciales basados en datos históricos

**Opción A: Stock mínimo general (simple)**
```sql
-- Establecer stock mínimo basado en categorías
UPDATE productos SET stock_minimo = 100 WHERE nombre_medida = 'Unidad';
UPDATE productos SET stock_minimo = 50 WHERE nombre_medida = 'Caja';
UPDATE productos SET stock_minimo = 25 WHERE nombre_medida = 'Paquete';
```

**Opción B: Stock mínimo personalizado (recomendado)**
```sql
-- Calcular stock mínimo basado en promedio de consumo mensual
-- (Requiere datos históricos de movimientos)
UPDATE productos p
SET stock_minimo = COALESCE(
  (
    SELECT CEIL(AVG(m.cantidad) * 1.2) -- Promedio + 20% de margen
    FROM movimientos m
    WHERE m.producto_id = p.id
    AND m.tipo_movimiento = 'salida'
    AND m.fecha_movimiento >= NOW() - INTERVAL '3 months'
  ),
  50 -- Valor por defecto si no hay datos
);
```

### 3. Actualizar validación del backend

**Archivo:** `almacen-instituto/src/middleware/validation.js`

```javascript
// Agregar al productSchema
stock_minimo: Joi.number().integer().min(0).default(50).messages({
  'number.base': 'El stock mínimo debe ser un número',
  'number.integer': 'El stock mínimo debe ser un número entero',
  'number.min': 'El stock mínimo no puede ser negativo'
}),
```

### 4. Actualizar controlador del backend

**Archivo:** `almacen-instituto/src/controllers/productController.js`

```javascript
// En el método getAllProducts, agregar stock_minimo al select
let query = supabase
  .from('productos')
  .select('*, stock_minimo') // ✅ Agregar stock_minimo
```

### 5. Actualizar frontend (ya está preparado)

El frontend ya está listo para recibir `stock_minimo`:

```javascript
// src/services/api.js - línea 53
min_stock: product.stock_minimo || 50, // ✅ Ya implementado
```

### 6. Actualizar ProductoModal para editar stock mínimo

**Archivo:** `src/components/ProductoModal.jsx`

```jsx
// Agregar campo en el formulario
<div className="form-group">
  <label>Stock Mínimo *</label>
  <input
    type="number"
    name="min_stock"
    value={formData.min_stock}
    onChange={handleChange}
    min="0"
    required
  />
  <small>Cantidad mínima antes de generar alerta</small>
</div>
```

## 📊 COMPARACIÓN DE RESULTADOS

### ANTES (Con el bug):
```
Producto: Pañal de gamer
Stock actual: 1000
Stock mínimo (mayor): 6251 ❌ (precio, no cantidad)
Estado: ALERTA ALTA ❌ (incorrecto)
```

### AHORA (Con el fix temporal):
```
Producto: Pañal de gamer
Stock actual: 1000
Stock mínimo: 50 ✅ (valor por defecto)
Estado: OK ✅ (correcto)
```

### FUTURO (Con el campo en BD):
```
Producto: Pañal de gamer
Stock actual: 1000
Stock mínimo: 100 ✅ (valor personalizado)
Estado: OK ✅ (correcto, basado en consumo real)
```

## 🚀 PASOS PARA IMPLEMENTAR LA SOLUCIÓN DEFINITIVA

1. **Backup de la base de datos** (importante)
2. **Ejecutar SQL** en Supabase para agregar el campo
3. **Actualizar validaciones** en `almacen-instituto/src/middleware/validation.js`
4. **Actualizar controladores** para incluir el nuevo campo
5. **Actualizar modal** de productos en el frontend
6. **Probar** creación y edición de productos
7. **Verificar** que las alertas funcionan correctamente

## 🧪 TESTING

**Prueba 1: Alertas correctas**
```bash
# Crear producto con stock bajo
POST /api/products
{
  "codigo_item": "TEST001",
  "nombre_item": "Producto Test",
  "stock_actual": 10,
  "stock_minimo": 50  # ← Ahora se puede especificar
}

# Verificar que aparece en alertas
GET /api/alerts
# Debe incluir "Producto Test" con prioridad ALTA
```

**Prueba 2: Alertas NO deben aparecer**
```bash
# Producto con stock suficiente
{
  "stock_actual": 1000,
  "stock_minimo": 50
}

# NO debe aparecer en alertas ✅
```

## 📝 NOTAS ADICIONALES

- El valor **50 unidades** es un valor conservador para evitar falsas alertas
- Puedes ajustarlo en `src/services/api.js` línea 54 si necesitas otro valor
- Una vez que agregues el campo a la BD, todas las alertas se calcularán correctamente
- El sistema ya está preparado para recibir el campo del backend

## ⚡ CAMBIOS REALIZADOS

**Archivos modificados:**
- ✅ `src/services/api.js` (línea 53-54, 94)
- ✅ `FIX-STOCK-MINIMO.md` (este archivo)

**Archivos por modificar (backend):**
- ⏳ Base de datos Supabase (agregar columna)
- ⏳ `almacen-instituto/src/middleware/validation.js`
- ⏳ `almacen-instituto/src/controllers/productController.js`

**Archivos por modificar (frontend):**
- ⏳ `src/components/ProductoModal.jsx` (agregar campo min_stock)

---

**Autor:** Copilot  
**Fecha:** 27 de Octubre, 2025  
**Versión:** 1.0
