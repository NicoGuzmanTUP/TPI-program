import { z } from 'zod'

// Espeja PedidoCreate de backend/app/modules/pedidos/schemas.py
export const checkoutSchema = z.object({
  direccion_entrega: z
    .string()
    .trim()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede superar 200 caracteres'),
  forma_pago: z.enum(['EFECTIVO', 'TRANSFERENCIA']),
  notas: z.string().trim(),
})
