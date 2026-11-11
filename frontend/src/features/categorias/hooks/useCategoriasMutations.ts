import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleApiError } from '../../../shared/api/handleApiError'
import { actualizarCategoria, crearCategoria, eliminarCategoria } from '../api/categoriasApi'
import type { CategoriaInput } from '../types/schemas'

function useInvalidar() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['categorias'] })
    void queryClient.invalidateQueries({ queryKey: ['productos'] })
  }
}

export function useGuardarCategoria() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, datos }: { id?: number; datos: CategoriaInput }) =>
      id === undefined ? crearCategoria(datos) : actualizarCategoria(id, datos),
    onSuccess: (_, { id }) => {
      toast.success(id === undefined ? 'Categoría creada' : 'Categoría actualizada')
      invalidar()
    },
    onError: (error) => toast.error(handleApiError(error)),
  })
}

export function useEliminarCategoria() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => {
      toast.success('Categoría dada de baja')
      invalidar()
    },
    onError: (error) => toast.error(handleApiError(error)),
  })
}
