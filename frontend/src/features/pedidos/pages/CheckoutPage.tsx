import { useForm } from '@tanstack/react-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { errorCampo } from '../../../shared/utils/errorCampo'
import { formatoPrecio } from '../../../shared/utils/formatoPrecio'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types'
import { checkoutSchema } from '../types/schemas'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())
  const navigate = useNavigate()
  const crear = useCrearPedido()

  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    validators: { onSubmit: checkoutSchema },
    onSubmit: async ({ value }) => {
      try {
        await crear.mutateAsync({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega,
          notas: value.notas || null,
        })
      } catch {
        return // el toast del error lo muestra el hook
      }
      vaciar()
      toast.success('¡Pedido creado!')
      navigate('/mis-pedidos', { replace: true })
    },
  })

  if (items.length === 0 && !crear.isSuccess) return <Navigate to="/carrito" replace />

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Finalizar pedido</h1>
      <Card className="mb-4 p-4">
        <ul className="divide-y divide-borde text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between py-1">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>{formatoPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-right font-bold">Total: {formatoPrecio(total)}</p>
      </Card>
      <Card className="p-6">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field name="direccion_entrega">
            {(field) => (
              <Input
                id="direccion_entrega"
                label="Dirección de entrega"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={errorCampo(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field name="forma_pago">
            {(field) => (
              <div className="flex flex-col gap-1">
                <label htmlFor="forma_pago" className="text-sm font-medium">
                  Forma de pago
                </label>
                <select
                  id="forma_pago"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                  className="rounded-xl border border-borde bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tomate/40"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
            )}
          </form.Field>
          <form.Field name="notas">
            {(field) => (
              <div className="flex flex-col gap-1">
                <label htmlFor="notas" className="text-sm font-medium">
                  Notas (opcional)
                </label>
                <textarea
                  id="notas"
                  rows={3}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl border border-borde bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tomate/40"
                />
              </div>
            )}
          </form.Field>
          <Button type="submit" cargando={crear.isPending}>
            Confirmar pedido
          </Button>
        </form>
      </Card>
    </section>
  )
}
