# Sistema de Gestión de Almacén - Web

> **✅ ACTUALIZACIÓN OCTUBRE 2025:** Sistema de productos completamente funcional con integración a Supabase. Los 10 productos existentes se cargan correctamente. Transformación bidireccional de datos implementada. Ver `CAMBIOS_REALIZADOS.md` para detalles completos.

> **🐛 FIX 27/10/2025:** Corregido bug de alertas de stock. El campo `mayor` (precio mayorista) se usaba incorrectamente como stock mínimo. Ahora usa valor por defecto de 50 unidades. Ver `FIX-STOCK-MINIMO.md` para la solución definitiva.

Versión web del sistema de gestión de almacén, construido con **React** y **JavaScript**. Consume la API REST del backend desplegado en Render.

## 🚀 Características

- ✅ **8 Módulos principales**: Dashboard, Productos, Movimientos, Alertas, Bajas, Sobrantes, Reportes, Lotes FEFO
- ✅ **Sistema FEFO**: First Expired First Out para gestión de lotes y fechas de vencimiento
- ✅ **Interfaz moderna**: Diseño responsivo con CSS moderno
- ✅ **API REST**: Consume backend en https://almacen-instituto.onrender.com/api
- ✅ **React Router**: Navegación entre módulos sin recargar página
- ✅ **Custom Hooks**: `useApi` y `useApiMutation` para manejo de datos
- ✅ **Alertas en tiempo real**: Notificaciones de stock bajo y lotes próximos a vencer

## 📋 Requisitos Previos

- **Node.js** >= 16.x
- **npm** >= 8.x o **yarn** >= 1.22.x
- Backend API corriendo en Render o localmente

## 🛠️ Instalación

1. **Clonar o navegar al proyecto**:
   ```bash
   cd c:\Users\Cris\Desktop\almacen-web
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   
   El archivo `.env` ya está creado con:
   ```
   VITE_API_URL=https://almacen-instituto.onrender.com/api
   ```

   Para desarrollo local, cambiar a:
   ```
   VITE_API_URL=http://localhost:3003/api
   ```

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

   La aplicación se abrirá en: http://localhost:3000

## 📁 Estructura del Proyecto

```
almacen-web/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProductoModal.jsx
│   ├── pages/               # Páginas principales (8 módulos)
│   │   ├── Dashboard.jsx
│   │   ├── Productos.jsx
│   │   ├── Movimientos.jsx
│   │   ├── Alertas.jsx
│   │   ├── Bajas.jsx
│   │   ├── Sobrantes.jsx
│   │   ├── Reportes.jsx
│   │   └── Lotes.jsx
│   ├── services/            # Servicios de API
│   │   └── api.js           # Cliente REST (ported from Python)
│   ├── hooks/               # Custom React Hooks
│   │   └── useApi.js        # Hook para consumir API
│   ├── utils/               # Utilidades
│   │   └── fefo.js          # Lógica FEFO (ported from Python)
│   ├── styles/              # Estilos globales
│   │   └── globals.css      # Design system (ported from styles.py)
│   ├── App.jsx              # Configuración de rutas
│   └── main.jsx             # Punto de entrada
├── .env                     # Variables de entorno
├── package.json             # Dependencias
├── vite.config.js           # Configuración Vite
└── index.html               # HTML principal
```

## 🎨 Sistema de Diseño

Migrado completamente desde `ui/styles.py` del proyecto desktop:

### Colores
- **Primary**: `#2563eb` (azul)
- **Success**: `#059669` (verde)
- **Warning**: `#d97706` (naranja)
- **Danger**: `#dc2626` (rojo)
- **Info**: `#0891b2` (cyan)

### Tipografía
- Sistema de fuentes: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
- Tamaños: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`

### Espaciado
- Sistema: `xs` (4px), `sm` (8px), `md` (16px), `lg` (24px), `xl` (32px), `2xl` (48px)

## 🔌 API Endpoints

El sistema consume los siguientes endpoints del backend:

### Productos
- `GET /products` - Listar productos
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

### Movimientos
- `GET /movements` - Listar movimientos
- `POST /movements/entry` - Registrar entrada
- `POST /movements/exit` - Registrar salida

### Bajas
- `GET /wastage` - Listar bajas

### Sobrantes
- `GET /surplus` - Listar sobrantes

### Lotes
- `GET /batches` - Listar lotes

### Reportes
- `GET /reports/:tipo` - Generar reportes

## 🧪 Testing

```bash
# Ejecutar tests (cuando se implementen)
npm test
```

## 🏗️ Build para Producción

```bash
# Construir para producción
npm run build

# Preview de la build
npm run preview
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 🚀 Despliegue

### Vercel
1. Instalar Vercel CLI: `npm i -g vercel`
2. Ejecutar: `vercel`
3. Configurar variable de entorno `VITE_API_URL` en el dashboard

### Netlify
1. Instalar Netlify CLI: `npm i -g netlify-cli`
2. Ejecutar: `netlify deploy`
3. Configurar variable de entorno en Settings > Build & deploy

### GitHub Pages
```bash
npm run build
# Subir carpeta dist/ a gh-pages branch
```

## 📊 Módulos del Sistema

### 1. Dashboard
Vista general con 5 tarjetas estadísticas y alertas principales.

### 2. Productos
CRUD completo con búsqueda, filtros y validación de stock mínimo.

### 3. Movimientos
Registro de entradas y salidas con validación FEFO automática.

### 4. Alertas
Monitoreo de productos con stock bajo y alertas configurables.

### 5. Bajas
Historial de productos dados de baja con motivos.

### 6. Sobrantes
Registro de sobrantes detectados en inventario.

### 7. Reportes
9 tipos de reportes con filtros por fecha y exportación.

### 8. Lotes FEFO
Gestión completa de lotes con sistema First Expired First Out.

## 🔧 Diferencias con la Versión Desktop

| Característica | Desktop (Python/Tkinter) | Web (React/JS) |
|----------------|--------------------------|----------------|
| Interfaz | Ventanas nativas | Navegador web |
| Diseño | Tkinter widgets | CSS moderno responsive |
| Navegación | Tabs (notebook) | React Router |
| Estado | Variables locales | React Hooks |
| API Client | requests library | axios + fetch |
| FEFO Logic | Python classes | JavaScript classes |
| Caché | TTL cache (Python) | React Query (futuro) |
| Reportes | tkcalendar | HTML5 date inputs |

## 🐛 Troubleshooting

### Error: Cannot connect to API
**Solución**: Verificar que el backend esté corriendo y que `VITE_API_URL` esté configurado correctamente.

### Error: Module not found
**Solución**: Ejecutar `npm install` nuevamente.

### Página en blanco después de build
**Solución**: Verificar que la base URL esté configurada en `vite.config.js`:
```js
export default defineConfig({
  base: './',
  // ...
})
```

## 🤝 Comparación con el Desktop

### Ventajas de la Versión Web
- ✅ Acceso desde cualquier dispositivo
- ✅ No requiere instalación
- ✅ Actualizaciones instantáneas
- ✅ Responsive design
- ✅ Más fácil de desplegar

### Ventajas de la Versión Desktop
- ✅ Mayor rendimiento local
- ✅ Funciona sin internet (con API local)
- ✅ Integración nativa con OS

## 📝 Próximas Mejoras

- [ ] Implementar React Query para caché
- [ ] Agregar tests con Vitest
- [ ] Implementar autenticación
- [ ] Modo oscuro
- [ ] Exportar reportes a PDF/Excel
- [ ] Notificaciones push
- [ ] Progressive Web App (PWA)
- [ ] Gráficos con Chart.js

## 📞 Soporte

Para problemas o preguntas sobre la versión web, consultar:
- Versión desktop: `c:\Users\Cris\Desktop\almacen-front`
- Backend API: https://almacen-instituto.onrender.com

## 📄 Licencia

Este proyecto es una adaptación web del sistema desktop de gestión de almacén.

---

**Nota**: Este proyecto reutiliza toda la lógica del sistema desktop (FEFO, validaciones, flujos) adaptada a React y JavaScript.
