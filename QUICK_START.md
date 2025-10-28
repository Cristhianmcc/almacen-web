# 🚀 Quick Start Guide

## Inicio Rápido (5 minutos)

### 1. Verificar Requisitos
```bash
node --version  # Debe ser >= 16.x
npm --version   # Debe ser >= 8.x
```

### 2. Instalar Dependencias (si no se hizo)
```bash
cd c:\Users\Cris\Desktop\almacen-web
npm install
```

### 3. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

✅ **La aplicación debería abrir en**: http://localhost:3000

---

## 🎯 Navegación Rápida

Una vez iniciado el servidor, puedes acceder directamente a:

- **Dashboard**: http://localhost:3000/dashboard
- **Productos**: http://localhost:3000/productos
- **Movimientos**: http://localhost:3000/movimientos
- **Alertas**: http://localhost:3000/alertas
- **Bajas**: http://localhost:3000/bajas
- **Sobrantes**: http://localhost:3000/sobrantes
- **Reportes**: http://localhost:3000/reportes
- **Lotes**: http://localhost:3000/lotes

---

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor desarrollo (puerto 3000)

# Producción
npm run build        # Construye para producción (carpeta dist/)
npm run preview      # Preview de la build de producción

# Análisis
npm run lint         # Ejecuta ESLint
```

---

## 🌐 Configuración de API

### Modo Producción (por defecto)
El archivo `.env` ya está configurado:
```
VITE_API_URL=https://almacen-instituto.onrender.com/api
```

### Modo Desarrollo Local
Si tu backend corre localmente en puerto 3003:

1. Editar `.env`:
```
VITE_API_URL=http://localhost:3003/api
```

2. Reiniciar el servidor:
```bash
# Ctrl+C para detener
npm run dev
```

---

## ✅ Verificación Post-Instalación

### 1. Dashboard debe mostrar:
- ✅ 5 tarjetas con estadísticas
- ✅ Lista de productos con stock bajo
- ✅ Últimos movimientos

### 2. Productos debe permitir:
- ✅ Ver lista de productos
- ✅ Crear nuevo producto (botón "➕ Nuevo Producto")
- ✅ Editar producto (botón ✏️)
- ✅ Eliminar producto (botón 🗑️)
- ✅ Buscar por nombre o código

### 3. Movimientos debe permitir:
- ✅ Cambiar entre Entrada/Salida
- ✅ Seleccionar producto
- ✅ Ingresar cantidad
- ✅ Ver historial

---

## 🐛 Troubleshooting Rápido

### ❌ Error: "Cannot connect to API"
**Solución**:
1. Verificar que el backend esté corriendo
2. Verificar `VITE_API_URL` en `.env`
3. Abrir consola del navegador (F12) para ver errores

### ❌ Error: "Port 3000 is already in use"
**Solución**:
1. Detener otros servidores en puerto 3000
2. O cambiar puerto en `vite.config.js`:
```javascript
server: {
  port: 3001  // Cambia a 3001
}
```

### ❌ Pantalla en blanco
**Solución**:
1. Abrir consola del navegador (F12)
2. Ver errores en tab "Console"
3. Verificar que `npm install` se ejecutó correctamente

### ❌ Cambios no se reflejan
**Solución**:
1. Ctrl+Shift+R (recarga forzada)
2. Limpiar caché del navegador
3. Reiniciar servidor de desarrollo

---

## 📁 Estructura Rápida

```
almacen-web/
├── src/
│   ├── pages/           ← 8 módulos principales
│   ├── components/      ← Componentes reutilizables
│   ├── services/        ← Cliente API
│   ├── hooks/           ← Custom hooks
│   └── utils/           ← Lógica FEFO
├── .env                 ← Configuración API
└── package.json         ← Dependencias
```

---

## 🎨 Características Principales

### Dashboard
- 5 tarjetas estadísticas en tiempo real
- Productos con stock bajo
- Últimos movimientos

### Productos
- CRUD completo
- Búsqueda en tiempo real
- Validación de stock mínimo
- Alertas visuales

### Movimientos
- Registro de entradas/salidas
- Validación FEFO automática
- Historial completo

### Lotes FEFO
- Sistema First Expired First Out
- Alertas de vencimiento
- Seguimiento de lotes

---

## 🔗 Links Útiles

- **Proyecto Desktop**: `c:\Users\Cris\Desktop\almacen-front`
- **Backend API**: https://almacen-instituto.onrender.com
- **Documentación completa**: Ver `README.md`
- **Guía de migración**: Ver `MIGRACION.md`

---

## 💡 Consejos

1. **Desarrollo**: Mantén abierta la consola del navegador (F12)
2. **Hot Reload**: Los cambios se reflejan automáticamente
3. **Network Tab**: Útil para debug de llamadas API
4. **React DevTools**: Instala la extensión para debug avanzado

---

## 📞 Siguiente Paso

Una vez verificado que todo funciona:
1. Explorar cada módulo
2. Probar crear/editar productos
3. Registrar movimientos
4. Ver reportes

**¡Listo para usar!** 🎉
