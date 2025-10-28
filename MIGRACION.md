# Guía de Migración Desktop → Web

Este documento detalla cómo se migró el sistema de almacén desde Python/Tkinter a React/JavaScript.

## 🔄 Mapeo de Archivos

### Servicios Core

| Desktop (Python) | Web (JavaScript) | Estado |
|------------------|------------------|--------|
| `services/api.py` | `src/services/api.js` | ✅ Migrado |
| `services/fefo_service.py` | `src/utils/fefo.js` | ✅ Migrado |
| `services/cache_service.py` | React Query (futuro) | ⏳ Pendiente |
| `services/productos_service.py` | `src/hooks/useApi.js` | ✅ Integrado |

### Interfaces de Usuario

| Desktop (Python) | Web (JavaScript) | Estado |
|------------------|------------------|--------|
| `ui/main_window.py` | `src/App.jsx` + `src/components/Layout.jsx` | ✅ Migrado |
| `ui/dashboard_panel.py` | `src/pages/Dashboard.jsx` | ✅ Migrado |
| `ui/productos_panel.py` | `src/pages/Productos.jsx` | ✅ Migrado |
| `ui/movimientos_panel.py` | `src/pages/Movimientos.jsx` | ✅ Migrado |
| `ui/alertas_panel.py` | `src/pages/Alertas.jsx` | ✅ Migrado |
| `ui/bajas_panel.py` | `src/pages/Bajas.jsx` | ✅ Migrado |
| `ui/sobrantes_panel.py` | `src/pages/Sobrantes.jsx` | ✅ Migrado |
| `ui/reportes_panel.py` | `src/pages/Reportes.jsx` | ✅ Migrado |
| `ui/lotes_panel.py` | `src/pages/Lotes.jsx` | ✅ Migrado |
| `ui/styles.py` | `src/styles/globals.css` | ✅ Migrado |

## 🎨 Migración del Sistema de Diseño

### Colores (styles.py → globals.css)

```python
# Python (styles.py)
COLORS = {
    'primary': '#2563eb',
    'success': '#059669',
    'warning': '#d97706',
    'danger': '#dc2626'
}
```

```css
/* CSS (globals.css) */
:root {
  --color-primary: #2563eb;
  --color-success: #059669;
  --color-warning: #d97706;
  --color-danger: #dc2626;
}
```

### Tipografía

```python
# Python
FONTS = {
    'title': ('Segoe UI', 24, 'bold'),
    'normal': ('Segoe UI', 12)
}
```

```css
/* CSS */
:root {
  --font-family: 'Segoe UI', Roboto, sans-serif;
  --font-size-2xl: 1.5rem;  /* 24px */
  --font-size-base: 1rem;   /* 16px */
}
```

## 🔌 Migración de Servicios

### API Client (api.py → api.js)

**Python (requests)**:
```python
class ApiResponse:
    def get(self, endpoint):
        response = requests.get(f"{BASE_URL}{endpoint}")
        return response.json()
```

**JavaScript (axios)**:
```javascript
class ApiResponse {
  async get(endpoint) {
    const response = await this.client.get(endpoint)
    return { success: true, data: response.data }
  }
}
```

### FEFO Service (fefo_service.py → fefo.js)

**Python**:
```python
class LoteFEFO:
    def __init__(self, lote_id, fecha_vencimiento, cantidad_disponible):
        self.lote_id = lote_id
        self.fecha_vencimiento = fecha_vencimiento
```

**JavaScript**:
```javascript
export class LoteFEFO {
  constructor(loteId, fechaVencimiento, cantidadDisponible) {
    this.loteId = loteId
    this.fechaVencimiento = new Date(fechaVencimiento)
  }
}
```

## 🧩 Migración de Componentes UI

### Navegación (Tabs → Router)

**Desktop (Tkinter)**:
```python
notebook = ttk.Notebook(root)
notebook.add(dashboard_panel, text="Dashboard")
notebook.add(productos_panel, text="Productos")
```

**Web (React Router)**:
```javascript
<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/productos" element={<Productos />} />
</Routes>
```

### Tablas (Treeview → HTML Table)

**Desktop**:
```python
tree = ttk.Treeview(frame, columns=('Código', 'Nombre'))
tree.heading('Código', text='Código')
tree.insert('', 'end', values=(producto.code, producto.name))
```

**Web**:
```jsx
<table>
  <thead>
    <tr>
      <th>Código</th>
      <th>Nombre</th>
    </tr>
  </thead>
  <tbody>
    {productos.map(p => (
      <tr key={p.id}>
        <td>{p.code}</td>
        <td>{p.name}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### Formularios (Tkinter → HTML Forms)

**Desktop**:
```python
nombre_entry = ttk.Entry(form_frame)
nombre_entry.grid(row=0, column=1)
```

**Web**:
```jsx
<input
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
/>
```

## 📊 Gestión de Estado

### Desktop (Variables de clase)
```python
class ProductosPanel:
    def __init__(self):
        self.productos = []
        
    def cargar_productos(self):
        response = api.get('/products')
        self.productos = response
```

### Web (React Hooks)
```javascript
function Productos() {
  const { data: productos, loading, refetch } = useApi('/products')
  
  // productos se actualiza automáticamente
}
```

## 🎯 Funcionalidades Implementadas

### ✅ Totalmente Migradas
- [x] Sistema FEFO completo (LoteFEFO, DistribucionFEFO)
- [x] CRUD de productos
- [x] Registro de movimientos (entrada/salida)
- [x] Alertas de stock bajo
- [x] Visualización de bajas
- [x] Visualización de sobrantes
- [x] Sistema de reportes
- [x] Gestión de lotes con vencimientos
- [x] Validaciones de formularios
- [x] Búsqueda y filtros
- [x] Design system completo

### ⏳ Mejoras Futuras
- [ ] Sistema de caché (similar a cache_service.py)
- [ ] Exportación de reportes a PDF
- [ ] Gráficos y visualizaciones
- [ ] Notificaciones push
- [ ] Modo offline (PWA)

## 🚀 Ventajas de la Versión Web

1. **Accesibilidad**: Desde cualquier dispositivo con navegador
2. **Despliegue**: Sin instalación en cliente
3. **Actualizaciones**: Instantáneas para todos los usuarios
4. **Responsive**: Se adapta a móviles y tablets
5. **Escalabilidad**: Fácil añadir nuevas funcionalidades

## 📝 Notas de Implementación

### Manejo de Fechas
- Desktop: `datetime.datetime`
- Web: `new Date()` + `toLocaleDateString()`

### Validaciones
- Desktop: Mensajes en `messagebox.showerror()`
- Web: `alert()` (mejorar con toast notifications)

### Estilos
- Desktop: `ttk.Style()` configurado por código
- Web: CSS moderno con variables CSS

### Routing
- Desktop: Cambio de tabs con `notebook.select()`
- Web: React Router con `<NavLink>` y navegación por URL

## 🔍 Diferencias Técnicas Clave

| Aspecto | Desktop | Web |
|---------|---------|-----|
| Lenguaje | Python 3.9+ | JavaScript ES6+ |
| UI Framework | Tkinter | React 18 |
| HTTP Client | requests | axios |
| Estado | Variables de instancia | React Hooks |
| Navegación | ttk.Notebook tabs | React Router |
| Styling | ttk.Style() + configure | CSS + CSS Variables |
| Build | No requiere | Vite build |
| Deployment | Instalador .exe | Hosting web |

## 🎓 Lecciones Aprendidas

1. **Hooks > Clases**: Los hooks de React (`useApi`, `useApiMutation`) simplifican el manejo de estado
2. **CSS Variables**: Más flexible que estilos inline como en Tkinter
3. **Componentes**: Reutilización mayor que en Tkinter widgets
4. **Routing**: Navegación por URL mejor UX que tabs
5. **Async/Await**: Más limpio que callbacks de Tkinter

## 📚 Recursos

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Axios Docs](https://axios-http.com)
- [React Router](https://reactrouter.com)

---

**Última actualización**: Enero 2025
**Versión Desktop**: c:\Users\Cris\Desktop\almacen-front
**Versión Web**: c:\Users\Cris\Desktop\almacen-web
