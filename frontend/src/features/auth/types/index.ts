// Espeja UserPublic de backend/app/modules/usuarios/schemas.py
export type Rol = 'admin' | 'user'

export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}
