import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleApiError } from '../../../shared/api/handleApiError'
import { cambiarEstadoUsuario, listarUsuarios } from '../api/usuariosApi'

export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios })
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      cambiarEstadoUsuario(id, activar),
    onSuccess: (_, { activar }) => {
      toast.success(activar ? 'Usuario activado' : 'Usuario desactivado')
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
    onError: (error) => toast.error(handleApiError(error)),
  })
}
