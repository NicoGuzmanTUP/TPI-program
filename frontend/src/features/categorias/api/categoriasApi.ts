import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Categoria } from '../types'
import type { CategoriaInput } from '../types/schemas'

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias')
  return data
}

export async function crearCategoria(datos: CategoriaInput): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>('/categorias', datos)
  return data
}

export async function actualizarCategoria(id: number, datos: CategoriaInput): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(`/categorias/${id}`, datos)
  return data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`)
}
