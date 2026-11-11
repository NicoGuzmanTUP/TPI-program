import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listarProductos } from '../api/productosApi'
import type { FiltrosProductos } from '../types'

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData,
  })
}
