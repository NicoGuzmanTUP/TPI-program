import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleApiError } from '../../../shared/api/handleApiError'
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
} from '../api/productosApi'
import type { ProductoInput } from '../types/schemas'

function useInvalidar() {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: ['productos'] })
}

export function useGuardarProducto() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, datos }: { id?: number; datos: ProductoInput }) =>
      id === undefined ? crearProducto(datos) : actualizarProducto(id, datos),
    onSuccess: (_, { id }) => {
      toast.success(id === undefined ? 'Producto creado' : 'Producto actualizado')
      invalidar()
    },
    onError: (error) => toast.error(handleApiError(error)),
  })
}

export function useActualizarStock() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, cambios }: { id: number; cambios: { stock?: number; disponible?: boolean } }) =>
      actualizarStock(id, cambios),
    onSuccess: () => {
      toast.success('Producto actualizado')
      invalidar()
    },
    onError: (error) => toast.error(handleApiError(error)),
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => {
      toast.success('Producto dado de baja')
      invalidar()
    },
    onError: (error) => toast.error(handleApiError(error)),
  })
}
