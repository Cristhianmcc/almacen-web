# ✅ SOLUCIONADO: Stock Mínimo Configurado en 50

## 🎯 Problema Resuelto

**Antes**: La consulta buscaba `stock_actual < stock_minimo` pero NO existía el campo `stock_minimo` → Alerta nunca se disparaba

**Ahora**: La consulta busca `stock_actual < 50` (valor fijo) → Alerta SÍ se dispara

---

## 🚀 PRUEBA INMEDIATA

### 1. Reiniciar Backend
En la terminal del backend (almacen-instituto):
```powershell
Ctrl + C
npm run dev
```

Deberías ver:
```
🔔 Inicializando servicio de alertas automáticas...
✅ Servicio de alertas iniciado correctamente
```

### 2. Hacer un Movimiento
- Ve a: http://localhost:3000/movimientos
- Registra **SALIDA de 1 unidad** del papel bond
- El stock bajará de 10 a 9

### 3. Observar Backend
Verás INMEDIATAMENTE:
```
🔔 ===== VERIFICACIÓN INMEDIATA =====
📦 Producto ID: XX
⚙️ Umbral configurado: 50
✅ Producto papel bond: stock_actual=9 < 50
📧 Enviando email...
✅ Notificación enviada
```

### 4. Revisar Gmail (30-60 segundos)
Email: **"⚠️ Alerta: Productos con Stock Bajo"**
- Papel bond - Stock: 9/50

---

## ⚙️ Cambiar el Umbral

Si quieres otro valor (no 50):

1. Archivo: `C:\Users\Cris\Desktop\almacen-instituto\src\services\alertasService.js`
2. Línea 14: `const UMBRAL_STOCK_BAJO = 50;`
3. Cambia `50` por tu valor (ej: `100`, `30`, etc.)
4. Reinicia backend

---

## 📦 Backup Disponible

Si algo falla:
```powershell
Copy-Item "C:\Users\Cris\Desktop\almacen-instituto\src\services\alertasService.js.backup" "C:\Users\Cris\Desktop\almacen-instituto\src\services\alertasService.js" -Force
```

---

**HAZLO AHORA:** Reinicia backend → Movimiento → Email debería llegar ✅
