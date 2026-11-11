import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { RegisterValues } from '../types/schemas'
import type { Usuario } from '../types'

export async function registrar(datos: RegisterValues): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>('/auth/register', datos)
  return data
}
