import { z } from 'zod'

// Espeja ProductoCreate de backend/app/modules/productos/schemas.py
export const productoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().trim(),
  precio_base: z.number('Ingresá un precio').min(0, 'El precio no puede ser negativo'),
  imagen_url: z
    .string()
    .trim()
    .refine((v) => v === '' || URL.canParse(v), 'URL inválida'),
  stock: z
    .number('Ingresá el stock')
    .int('El stock debe ser entero')
    .min(0, 'El stock no puede ser negativo'),
  disponible: z.boolean(),
  categoria_id: z.number().int().min(1, 'Elegí una categoría'),
})

export interface ProductoInput {
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  categoria_id: number
}
