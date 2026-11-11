import { useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { useActualizarStock } from '../hooks/useProductosMutations'
import type { Producto } from '../types'

/** Edita stock y disponibilidad de un producto desde la tabla. */
export function StockCell({ producto }: { producto: Producto }) {
  const actualizar = useActualizarStock()
  const [stock, setStock] = useState(String(producto.stock))
  const valor = Number(stock)
  const valido = stock !== '' && Number.isInteger(valor) && valor >= 0
  const cambio = valido && valor !== producto.stock

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        step={1}
        value={stock}
        aria-label={`Stock de ${producto.nombre}`}
        onChange={(e) => setStock(e.target.value)}
        className="w-20 rounded-xl border border-borde bg-white px-2 py-1 text-sm"
      />
      <Button
        variante="secundario"
        disabled={!cambio}
        cargando={actualizar.isPending}
        onClick={() => actualizar.mutate({ id: producto.id, cambios: { stock: valor } })}
      >
        Guardar
      </Button>
    </div>
  )
}
