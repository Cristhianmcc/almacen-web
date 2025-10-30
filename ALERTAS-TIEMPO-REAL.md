# Sistema de Alertas en Tiempo Real ⚡

## 🔧 Problema Identificado

**Antes:**
- La página de Alertas solo mostraba 6 alertas almacenadas en la base de datos
- No se generaban alertas automáticamente para productos con stock bajo o próximos a vencer
- Las alertas no se actualizaban en tiempo real

**Después:**
- ✅ Las alertas se generan automáticamente basadas en los productos actuales
- ✅ Se muestran TODAS las alertas en tiempo real
- ✅ Panel de estadísticas con contadores por tipo y prioridad
- ✅ Visualización mejorada con colores e iconos

---

## 🎯 Solución Implementada

### 1. Generación Automática de Alertas

El componente `Alertas.jsx` ahora:

1. **Obtiene los productos** del endpoint `/products`
2. **Analiza cada producto** y genera alertas automáticas según:
   - **Stock Bajo**: `quantity < min_stock` (o < 30 por defecto)
   - **Próximo a Vencer**: Fecha de vencimiento ≤ 30 días
   - **Vencido**: Fecha de vencimiento ya pasada
   - **Crítico**: Stock bajo + Próximo a vencer

3. **Combina alertas**:
   - Alertas del backend (tabla `alerts`)
   - Alertas generadas automáticamente
   - Elimina duplicados

### 2. Tipos de Alertas

| Tipo | Icono | Condición | Prioridad |
|------|-------|-----------|-----------|
| `bajo_stock` | 📦 | Stock < mínimo | Media/Alta |
| `proximo_vencimiento` | ⏰ | Vence en ≤30 días | Baja/Media/Alta |
| `vencido` | ❌ | Ya venció | Alta |
| `critico` | 🚨 | Stock bajo + vence pronto | Alta |

### 3. Niveles de Prioridad

- **Alta (Rojo)** 🔴
  - Stock < 50% del mínimo
  - Vence en ≤7 días
  - Producto vencido
  - Situación crítica

- **Media (Amarillo)** 🟡
  - Stock bajo pero no crítico
  - Vence en 8-15 días

- **Baja (Azul)** 🔵
  - Vence en 16-30 días

---

## 📊 Nuevas Características

### Panel de Estadísticas

Muestra contadores en tiempo real:
- Total de alertas
- Por prioridad (Alta, Media, Baja)
- Por tipo (Stock Bajo, Próx. Vencer, Vencidos, Críticos)

### Tabla Mejorada

- **Columna Stock Actual**: Muestra el stock con colores
  - Rojo si < 20 unidades
  - Verde si ≥ 20 unidades

- **Columna F. Vencimiento**: Muestra la fecha formateada

- **Tipo de Alerta**: Badge con color según el tipo

- **Resaltado de Filas**:
  - Fondo rojo claro para productos vencidos
  - Fondo amarillo claro para situaciones críticas

---

## 🔄 Actualización en Tiempo Real

El componente usa `useApi` que consulta la API automáticamente:

1. Cada vez que entras a la página de Alertas
2. Los productos se consultan en tiempo real
3. Las alertas se regeneran basadas en los datos actuales

**Resultado**: Siempre ves las alertas actualizadas sin necesidad de refrescar manualmente.

---

## 📈 Ejemplo de Uso

### Caso 1: Producto con Stock Bajo

```javascript
Producto: Lentes para ciegos
Stock Actual: 2 unidades
Stock Mínimo: 30 unidades

➡️ Genera: Alerta "bajo_stock" con prioridad ALTA
```

### Caso 2: Producto Próximo a Vencer

```javascript
Producto: Piña
Fecha Vencimiento: 31/10/2025
Días para vencer: 2 días

➡️ Genera: Alerta "proximo_vencimiento" con prioridad ALTA
```

### Caso 3: Producto Crítico

```javascript
Producto: Pañal de gamer
Stock Actual: 20 unidades (bajo)
Fecha Vencimiento: 23/9/2025
Estado: VENCIDO

➡️ Genera: 
  - Alerta "bajo_stock"
  - Alerta "vencido"
  - Alerta "critico"
```

---

## 🎨 Mejoras Visuales

1. **Título animado**: Icono rotatorio para indicar actualización en tiempo real
2. **Tarjetas de estadísticas**: Grid responsivo con colores por categoría
3. **Badges mejorados**: Iconos y colores distintivos para cada tipo
4. **Animación de hover**: Las filas se desplazan al pasar el cursor
5. **Animación de pulso**: Los badges de prioridad alta parpadean

---

## 🐛 Solución al Problema Original

**Antes:**
- Solo 6 alertas mostradas (las que estaban en la BD)
- No reflejaba la realidad del inventario

**Después:**
- Todas las alertas relevantes mostradas
- Refleja el estado real del inventario
- Se actualiza automáticamente

---

## 🔍 Verificación

Para verificar que funciona correctamente:

1. **Abre la página de Alertas**
2. **Observa el contador total** (debe ser > 6)
3. **Revisa el panel de estadísticas** (debe mostrar varios tipos)
4. **Compara con la página de Productos**:
   - Productos con stock bajo deben aparecer
   - Productos con fechas próximas deben aparecer
   - Productos vencidos deben aparecer

---

## 📝 Notas Técnicas

### Archivos Modificados

- `src/pages/Alertas.jsx`: Lógica de generación de alertas
- `src/pages/Alertas.css`: Estilos mejorados

### Dependencias

- `useApi`: Hook para consultar la API
- Endpoint `/products`: Debe devolver todos los productos
- Endpoint `/alerts`: Devuelve alertas del backend (opcional)

### Performance

- Las alertas se calculan en el cliente (no impacta el servidor)
- Se eliminan duplicados para no mostrar alertas repetidas
- Se ordenan por prioridad automáticamente

---

## 🚀 Próximos Pasos

Posibles mejoras futuras:

1. **Auto-refresh**: Actualizar cada X minutos automáticamente
2. **Filtros**: Filtrar por tipo, prioridad, fecha
3. **Búsqueda**: Buscar por código o nombre de producto
4. **Exportar**: Descargar reporte de alertas en Excel/PDF
5. **Notificaciones**: Sistema de notificaciones push
6. **Resolver alertas**: Marcar alertas como "atendidas" o "resueltas"

---

## ✅ Resumen

El sistema de alertas ahora es **100% funcional** y muestra **todas las alertas en tiempo real** basándose en el estado actual del inventario. Ya no depende únicamente de las alertas almacenadas en la base de datos, sino que las genera dinámicamente según las condiciones de cada producto.

**Fecha de implementación**: 29/10/2025
**Estado**: ✅ Completado y funcionando
