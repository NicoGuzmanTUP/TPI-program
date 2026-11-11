import { useState } from 'react'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { ButtonLink } from '../../../shared/ui/ButtonLink'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'
import { Card } from '../../../shared/ui/Card'
import { formatoPrecio } from '../../../shared/utils/formatoPrecio'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false)

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo."
        accion={<ButtonLink to="/">Ver catálogo</ButtonLink>}
      />
    )
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Carrito</h1>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Card key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-40 flex-1">
              <h2 className="font-semibold">{item.nombre}</h2>
              <p className="text-sm text-tinta-suave">{formatoPrecio(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variante="secundario"
                aria-label={`Restar uno a ${item.nombre}`}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center font-semibold">{item.cantidad}</span>
              <Button
                variante="secundario"
                aria-label={`Sumar uno a ${item.nombre}`}
                disabled={item.cantidad >= item.stock}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
              >
                +
              </Button>
            </div>
            <span className="w-28 text-right font-bold">
              {formatoPrecio(item.precio_unitario * item.cantidad)}
            </span>
            <Button variante="fantasma" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Button variante="secundario" onClick={() => setConfirmandoVaciar(true)}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold">Total: {formatoPrecio(total)}</span>
          <ButtonLink to="/checkout">Finalizar pedido</ButtonLink>
        </div>
      </div>
      <ConfirmModal
        abierto={confirmandoVaciar}
        titulo="Vaciar carrito"
        mensaje="¿Quitar todos los productos del carrito?"
        textoConfirmar="Vaciar"
        onCerrar={() => setConfirmandoVaciar(false)}
        onConfirmar={() => {
          vaciar()
          setConfirmandoVaciar(false)
        }}
      />
    </section>
  )
}
