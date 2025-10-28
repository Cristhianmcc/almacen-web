# Implementación del Endpoint /api/bajas

## Problema
El módulo de Bajas en el frontend no puede mostrar datos porque el endpoint `/api/bajas` no existe en el backend, aunque la tabla `bajas` sí existe en Supabase.

## Solución: Agregar Endpoint en el Backend

### 📁 Estructura de la Tabla `bajas` (Supabase)

Basándome en la aplicación desktop, la tabla debe tener:

```sql
CREATE TABLE bajas (
  id SERIAL PRIMARY KEY,
  codigo_producto VARCHAR(50),
  nombre_producto VARCHAR(255),
  motivo_baja TEXT,
  cantidad_baja INTEGER NOT NULL,
  fecha_baja TIMESTAMP DEFAULT NOW(),
  usuario VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🔧 Implementación en el Backend (Node.js/Express)

#### 1. Crear Controlador: `controllers/bajasController.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET /api/bajas - Listar todas las bajas
exports.getBajas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bajas')
      .select('*')
      .order('fecha_baja', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      timestamp: new Date().toISOString(),
      message: `${data?.length || 0} bajas encontradas`
    });
  } catch (error) {
    console.error('Error al obtener bajas:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// POST /api/bajas - Registrar nueva baja
exports.createBaja = async (req, res) => {
  try {
    const { 
      codigo_producto, 
      nombre_producto, 
      motivo_baja, 
      cantidad_baja, 
      usuario 
    } = req.body;

    // Validación
    if (!codigo_producto || !nombre_producto || !cantidad_baja) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos',
        timestamp: new Date().toISOString()
      });
    }

    const { data, error } = await supabase
      .from('bajas')
      .insert([{
        codigo_producto,
        nombre_producto,
        motivo_baja: motivo_baja || 'Sin especificar',
        cantidad_baja,
        usuario: usuario || 'admin',
        fecha_baja: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      timestamp: new Date().toISOString(),
      message: 'Baja registrada correctamente'
    });
  } catch (error) {
    console.error('Error al crear baja:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// GET /api/bajas/:id - Obtener baja por ID
exports.getBajaById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('bajas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Baja no encontrada',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener baja:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
```

#### 2. Crear Rutas: `routes/bajas.js`

```javascript
const express = require('express');
const router = express.Router();
const bajasController = require('../controllers/bajasController');

// GET /api/bajas - Listar todas las bajas
router.get('/', bajasController.getBajas);

// POST /api/bajas - Registrar nueva baja
router.post('/', bajasController.createBaja);

// GET /api/bajas/:id - Obtener baja específica
router.get('/:id', bajasController.getBajaById);

module.exports = router;
```

#### 3. Registrar Rutas en `server.js` o `app.js`

```javascript
const bajasRoutes = require('./routes/bajas');

// ... otras rutas

app.use('/api/bajas', bajasRoutes);
```

### 🧪 Pruebas

#### Probar GET
```bash
curl https://almacen-instituto.onrender.com/api/bajas
```

Respuesta esperada:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo_producto": "ITEM001",
      "nombre_producto": "Papel Bond A4",
      "motivo_baja": "Producto vencido",
      "cantidad_baja": 5,
      "fecha_baja": "2025-07-28T16:28:42.148Z",
      "usuario": "admin",
      "created_at": "2025-07-28T16:28:42.148Z"
    }
  ],
  "timestamp": "2025-10-27T10:00:00Z",
  "message": "6 bajas encontradas"
}
```

#### Probar POST
```bash
curl -X POST https://almacen-instituto.onrender.com/api/bajas \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_producto": "ITEM001",
    "nombre_producto": "Papel Bond A4",
    "motivo_baja": "Producto vencido",
    "cantidad_baja": 10,
    "usuario": "admin"
  }'
```

### 📊 Transformación de Datos (Frontend)

El frontend ya está preparado para recibir los datos con ambos formatos:

**Backend (Supabase):**
- `codigo_producto`
- `nombre_producto`
- `motivo_baja`
- `cantidad_baja`
- `fecha_baja`

**Frontend acepta también:**
- `product_code`
- `product_name`
- `reason`
- `quantity`
- `date`

### ✅ Verificación

1. Agregar el código del controlador
2. Agregar las rutas
3. Registrar en el servidor principal
4. Desplegar en Render
5. Probar con: `curl https://almacen-instituto.onrender.com/api/bajas`

### 📝 Archivos a Modificar en el Backend

```
almacen-instituto/
├── controllers/
│   └── bajasController.js    ← CREAR
├── routes/
│   └── bajas.js               ← CREAR
├── server.js                  ← MODIFICAR (agregar ruta)
└── .env                       ← Verificar credenciales Supabase
```

### 🎯 Estado Actual

- ❌ Endpoint `/api/bajas` no existe (404)
- ✅ Tabla `bajas` existe en Supabase
- ✅ Frontend preparado y esperando datos
- ⏳ Pendiente: Implementar endpoint en backend

Una vez implementado el endpoint, el módulo de Bajas funcionará automáticamente mostrando todos los registros de la tabla.
