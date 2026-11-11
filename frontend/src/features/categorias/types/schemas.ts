import { z } from 'zod'

// Espeja CategoriaCreate de backend/app/modules/categorias/schemas.py
export const categoriaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  descripcion: z.string().trim(),
})

export interface CategoriaInput {
  nombre: string
  descripcion: string | null
}
