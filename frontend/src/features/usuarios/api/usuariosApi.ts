import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../../auth/types'

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await axiosInstance.get<Usuario[]>('/admin/usuarios')
  return data
}

export async function cambiarEstadoUsuario(id: number, activar: boolean): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>(
    `/admin/usuarios/${id}/${activar ? 'activar' : 'desactivar'}`,
  )
  return data
}
