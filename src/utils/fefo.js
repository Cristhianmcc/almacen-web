/**
 * FEFO Service - First Expired First Out
 * Ported from Python fefo_service.py
 */

export class LoteFEFO {
  constructor(loteId, fechaVencimiento, cantidadDisponible, fechaIngreso = new Date()) {
    this.loteId = loteId
    this.fechaVencimiento = new Date(fechaVencimiento)
    this.cantidadDisponible = cantidadDisponible
    this.fechaIngreso = new Date(fechaIngreso)
  }

  estaVencido() {
    return this.fechaVencimiento < new Date()
  }

  diasParaVencer() {
    const diff = this.fechaVencimiento - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  toString() {
    return `Lote ${this.loteId} - Vence: ${this.fechaVencimiento.toLocaleDateString()} - Disponible: ${this.cantidadDisponible}`
  }
}

export class DistribucionFEFO {
  constructor(loteId, cantidad, fechaVencimiento) {
    this.loteId = loteId
    this.cantidad = cantidad
    this.fechaVencimiento = new Date(fechaVencimiento)
  }

  toString() {
    return `${this.cantidad} unidades del Lote ${this.loteId} (Vence: ${this.fechaVencimiento.toLocaleDateString()})`
  }
}

export class FEFOService {
  static crearLoteEntrada(productoId, cantidad, fechaVencimiento, loteId = null) {
    if (!loteId) {
      loteId = `LOTE-${productoId}-${Date.now()}`
    }

    return new LoteFEFO(loteId, fechaVencimiento, cantidad)
  }

  static calcularDistribucionFEFO(cantidadRequerida, lotes) {
    if (!lotes || lotes.length === 0) {
      throw new Error('No hay lotes disponibles')
    }

    // Sort by expiration date (FEFO - First Expired First Out)
    const lotesOrdenados = [...lotes].sort((a, b) => 
      new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
    )

    const distribucion = []
    let cantidadRestante = cantidadRequerida

    for (const lote of lotesOrdenados) {
      if (cantidadRestante <= 0) break

      const cantidadAUsar = Math.min(lote.cantidadDisponible, cantidadRestante)
      
      distribucion.push(new DistribucionFEFO(
        lote.loteId,
        cantidadAUsar,
        lote.fechaVencimiento
      ))

      cantidadRestante -= cantidadAUsar
    }

    if (cantidadRestante > 0) {
      throw new Error(
        `Stock insuficiente. Requerido: ${cantidadRequerida}, Disponible: ${cantidadRequerida - cantidadRestante}`
      )
    }

    return distribucion
  }

  static aplicarSalidaFEFO(lotes, cantidadSalida) {
    const distribucion = this.calcularDistribucionFEFO(cantidadSalida, lotes)
    const lotesActualizados = [...lotes]

    for (const dist of distribucion) {
      const lote = lotesActualizados.find(l => l.loteId === dist.loteId)
      if (lote) {
        lote.cantidadDisponible -= dist.cantidad
      }
    }

    // Remove empty lots
    return lotesActualizados.filter(l => l.cantidadDisponible > 0)
  }

  static obtenerFechaVencimientoProxima(lotes) {
    if (!lotes || lotes.length === 0) {
      return null
    }

    const lotesValidos = lotes.filter(l => l.cantidadDisponible > 0)
    if (lotesValidos.length === 0) {
      return null
    }

    const fechas = lotesValidos.map(l => new Date(l.fechaVencimiento))
    return new Date(Math.min(...fechas))
  }

  static verificarVencimientos(lotes, diasAlerta = 30) {
    const hoy = new Date()
    const alertas = []

    for (const lote of lotes) {
      const diasRestantes = lote.diasParaVencer()

      if (lote.estaVencido()) {
        alertas.push({
          tipo: 'VENCIDO',
          lote: lote.loteId,
          mensaje: `Lote ${lote.loteId} VENCIDO (${Math.abs(diasRestantes)} días)`,
          cantidad: lote.cantidadDisponible,
          fechaVencimiento: lote.fechaVencimiento,
          prioridad: 'ALTA'
        })
      } else if (diasRestantes <= diasAlerta) {
        alertas.push({
          tipo: 'PROXIMO_A_VENCER',
          lote: lote.loteId,
          mensaje: `Lote ${lote.loteId} vence en ${diasRestantes} días`,
          cantidad: lote.cantidadDisponible,
          fechaVencimiento: lote.fechaVencimiento,
          prioridad: diasRestantes <= 7 ? 'ALTA' : 'MEDIA'
        })
      }
    }

    return alertas
  }

  static obtenerResumenLotes(lotes) {
    const totalCantidad = lotes.reduce((sum, l) => sum + l.cantidadDisponible, 0)
    const lotesVencidos = lotes.filter(l => l.estaVencido()).length
    const lotesProximosVencer = lotes.filter(l => !l.estaVencido() && l.diasParaVencer() <= 30).length
    const fechaProximoVencimiento = this.obtenerFechaVencimientoProxima(lotes)

    return {
      totalLotes: lotes.length,
      totalCantidad,
      lotesVencidos,
      lotesProximosVencer,
      fechaProximoVencimiento,
      lotesActivos: lotes.filter(l => l.cantidadDisponible > 0).length
    }
  }

  static validarLote(lote) {
    const errores = []

    if (!lote.loteId) {
      errores.push('El lote debe tener un ID')
    }

    if (!lote.fechaVencimiento) {
      errores.push('El lote debe tener fecha de vencimiento')
    }

    if (lote.cantidadDisponible < 0) {
      errores.push('La cantidad disponible no puede ser negativa')
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }
}

export default FEFOService
