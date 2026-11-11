import { z } from 'zod'

// Espeja las reglas de UserCreate en backend/app/modules/usuarios/schemas.py
export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Ingresá tu usuario o email'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

export const registerSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es obligatorio'),
  full_name: z.string().trim().min(1, 'El nombre completo es obligatorio'),
  email: z.email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres'),
})

export type RegisterValues = z.infer<typeof registerSchema>
