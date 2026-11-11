import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types'

export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>('/pedidos', datos)
  return data
}

export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { pagina, limit, estado } = filtros
  const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', {
    params: { skip: (pagina - 1) * limit, limit, estado },
  })
  return data
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}

export async function obtenerResumen(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen')
  return data
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado })
  return data
}
