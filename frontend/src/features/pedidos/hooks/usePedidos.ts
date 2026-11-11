import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleApiError } from '../../../shared/api/handleApiError'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  listarPedidos,
  obtenerResumen,
} from '../api/pedidosApi'
import type { EstadoPedido, FiltrosPedidos } from '../types'

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
    onError: (error) => toast.error(handleApiError(error)),
  })
}

export function useCancelarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => {
      toast.success('Pedido cancelado')
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
    onError: (error) => toast.error(handleApiError(error)),
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: obtenerResumen })
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      toast.success('Estado del pedido actualizado')
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
    onError: (error) => toast.error(handleApiError(error)),
  })
}
