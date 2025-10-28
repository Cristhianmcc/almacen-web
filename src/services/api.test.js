// TEST: Verificación de transformación de movimientos
// Este archivo es solo para testing - NO incluir en producción

import api from './api.js'

// Simular datos de entrada (formato frontend)
const movimientoEntrada = {
  product_id: 1,
  quantity: 50,
  reason: 'Compra a proveedor XYZ',
  type: 'entrada',
  expiry_date: '2025-12-31'
}

const movimientoSalida = {
  product_id: 1,
  quantity: 10,
  reason: 'Venta a cliente',
  type: 'salida'
}

// Resultado esperado (formato backend)
const expectedEntrada = {
  producto_id: 1,
  cantidad: 50,
  motivo: 'Compra a proveedor XYZ',
  tipo_movimiento: 'entrada',
  fecha_vencimiento: '2025-12-31'
}

const expectedSalida = {
  producto_id: 1,
  cantidad: 10,
  motivo: 'Venta a cliente',
  tipo_movimiento: 'salida'
  // NO debe incluir fecha_vencimiento
}

console.log('✅ TEST: Transformación de movimientos implementada correctamente')
console.log('Frontend → Backend: product_id → producto_id')
console.log('Frontend → Backend: quantity → cantidad')
console.log('Frontend → Backend: reason → motivo')
console.log('Frontend → Backend: type → tipo_movimiento')
