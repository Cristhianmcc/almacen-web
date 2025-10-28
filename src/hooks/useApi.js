import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { autoFetch = true, dependencies = [] } = options

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get(endpoint)
      
      if (response.success) {
        setData(response.data)
      } else {
        setError(response.error || 'Error al cargar datos')
      }
    } catch (err) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData, ...dependencies])

  const refetch = () => {
    fetchData()
  }

  return { data, loading, error, refetch }
}

export function useApiMutation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (method, endpoint, data = null) => {
    setLoading(true)
    setError(null)

    try {
      let response
      
      switch (method.toUpperCase()) {
        case 'POST':
          response = await api.post(endpoint, data)
          break
        case 'PUT':
          response = await api.put(endpoint, data)
          break
        case 'DELETE':
          response = await api.delete(endpoint)
          break
        default:
          throw new Error(`Método no soportado: ${method}`)
      }

      if (!response.success) {
        setError(response.error || 'Error en la operación')
        return { success: false, error: response.error }
      }

      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.message || 'Error inesperado'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error }
}
