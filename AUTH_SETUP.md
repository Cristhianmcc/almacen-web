# 🔐 Sistema de Autenticación con Supabase

## ✅ Implementación Completada

### Archivos Creados

1. **`src/services/supabaseClient.js`** - Cliente de Supabase
2. **`src/services/auth.js`** - Servicio de autenticación
3. **`src/contexts/AuthContext.jsx`** - Context Provider para auth
4. **`src/pages/Login.jsx`** - Pantalla de login
5. **`src/pages/Login.css`** - Estilos del login
6. **`src/components/ProtectedRoute.jsx`** - HOC para rutas protegidas

### Archivos Modificados

1. **`src/App.jsx`** - Integración de AuthProvider y rutas
2. **`src/components/Sidebar.jsx`** - Botón de logout y user info
3. **`src/components/Sidebar.css`** - Estilos del footer
4. **`.env.example`** - Variables de entorno de Supabase

---

## 🚀 Pasos para Configurar

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```bash
VITE_API_URL=https://almacen-instituto.onrender.com/api
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

### 2. Obtener Credenciales de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings → API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Crear Usuario Admin en Supabase

1. En Supabase Dashboard, ve a **Authentication → Users**
2. Haz clic en **"Add user" → "Create new user"**
3. Ingresa:
   - **Email:** `admin@instituto.edu` (o el que prefieras)
   - **Password:** Tu contraseña segura
   - ✅ Marca **"Auto Confirm User"**
4. Haz clic en **"Create user"**

### 4. Iniciar la Aplicación

```bash
npm run dev
```

Accede a: `http://localhost:3000/login`

---

## 🎯 Funcionalidades Implementadas

### ✅ Login
- Formulario con email y password
- Validación de campos
- Manejo de errores
- Spinner de carga
- Diseño responsive

### ✅ Sesión Persistente
- La sesión se guarda automáticamente en localStorage
- Al recargar la página, el usuario sigue autenticado
- Token refresh automático

### ✅ Rutas Protegidas
- Solo usuarios autenticados pueden acceder
- Redirección automática a `/login` si no está autenticado
- Pantalla de carga mientras verifica sesión

### ✅ Logout
- Botón en el sidebar con confirmación
- Cierra sesión y redirige a login
- Limpia el estado de autenticación

### ✅ User Info
- Muestra email del usuario en el sidebar
- Icono de perfil
- Información visible solo cuando sidebar está expandido

---

## 📋 Uso del Sistema

### Login
```jsx
// Credenciales configuradas en Supabase
Email: admin@instituto.edu
Password: tu_contraseña_segura
```

### Logout
1. Haz clic en el botón **"Cerrar Sesión"** en el sidebar
2. Confirma la acción
3. Serás redirigido a `/login`

---

## 🔧 Personalización

### Cambiar Credenciales
- Ve a Supabase Dashboard → Authentication → Users
- Edita o crea nuevos usuarios

### Agregar Más Usuarios
- Actualmente solo admin
- Para escalabilidad, puedes crear más usuarios en Supabase
- Cada usuario tendrá su propio email y password

### Deshabilitar Confirmación de Email
- Ya está configurado con `Auto Confirm User`
- No requiere verificación de email

---

## 🐛 Troubleshooting

### "Error al iniciar sesión"
- ✅ Verifica que las variables de entorno estén correctas
- ✅ Confirma que el usuario existe en Supabase
- ✅ Revisa que el usuario esté confirmado (`email_confirmed_at` no sea null)

### "Usuario no autenticado"
- ✅ Limpia el localStorage: `localStorage.clear()`
- ✅ Verifica que el token no haya expirado
- ✅ Intenta hacer login nuevamente

### Variables de entorno no funcionan
- ✅ Reinicia el servidor de desarrollo: `Ctrl + C` y `npm run dev`
- ✅ Verifica que el archivo se llame `.env` (sin extensión)
- ✅ Las variables deben empezar con `VITE_`

---

## 🔒 Seguridad

### ✅ Implementado
- Tokens JWT automáticos por Supabase
- Sesión persistente cifrada
- Auto-refresh de tokens
- HTTPS en producción (Render)

### 🚫 NO Implementado (no necesario para caso de uso)
- Registro de usuarios (solo admin)
- Recuperación de contraseña
- Verificación de email
- Roles y permisos (solo 1 rol: admin)

---

## 📦 Dependencias

```json
{
  "@supabase/supabase-js": "^2.x.x"
}
```

Ya instalada con: `npm install @supabase/supabase-js`

---

## ✅ Checklist de Implementación

- [x] Instalar `@supabase/supabase-js`
- [x] Crear `supabaseClient.js`
- [x] Crear servicio `auth.js`
- [x] Crear `AuthContext`
- [x] Crear pantalla `Login`
- [x] Crear `ProtectedRoute`
- [x] Actualizar `App.jsx` con rutas
- [x] Agregar logout en `Sidebar`
- [x] Configurar variables de entorno
- [ ] **PENDIENTE:** Configurar variables `.env` con tus credenciales
- [ ] **PENDIENTE:** Crear usuario admin en Supabase Dashboard

---

## 🎉 ¡Listo para Usar!

Sigue los pasos de configuración y tendrás un sistema de autenticación completo y escalable con Supabase.
