import { toast } from 'sonner'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatoPrecio } from '../../../shared/utils/formatoPrecio'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  )
  const sinStock = producto.stock <= 0
  const noDisponible = !producto.disponible
  const alLimite = enCarrito >= producto.stock

  const motivo = noDisponible
    ? 'No disponible'
    : sinStock
      ? 'Sin stock'
      : alLimite
        ? 'Máximo en carrito'
        : null

  const onAgregar = () => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      stock: producto.stock,
    })
    toast.success(`${producto.nombre} agregado al carrito`)
  }

  return (
    <Card className="flex flex-col">
      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-48 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-crema-oscuro text-5xl">
          🍽️
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium text-oliva">{producto.categoria.nombre}</span>
        <h3 className="text-base font-semibold">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="line-clamp-2 text-sm text-tinta-suave">{producto.descripcion}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-tomate">{formatoPrecio(producto.precio_base)}</span>
          <span className="text-xs text-tinta-suave">Stock: {producto.stock}</span>
        </div>
        <Button onClick={onAgregar} disabled={motivo !== null}>
          {motivo ?? 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  )
}
