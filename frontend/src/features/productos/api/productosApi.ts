import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { FiltrosProductos, Producto, ProductosPaginados } from '../types'
import type { ProductoInput } from '../types/schemas'

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { pagina, limit, search, categoria_id, disponible } = filtros
  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', {
    params: {
      skip: (pagina - 1) * limit,
      limit,
      search: search || undefined,
      categoria_id,
      disponible,
    },
  })
  return data
}

export async function crearProducto(datos: ProductoInput): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>('/productos', datos)
  return data
}

export async function actualizarProducto(id: number, datos: ProductoInput): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, datos)
  return data
}

export async function actualizarStock(
  id: number,
  cambios: { stock?: number; disponible?: boolean },
): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, cambios)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`)
}
