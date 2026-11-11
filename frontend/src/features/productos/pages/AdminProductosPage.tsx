import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'
import { formatoPrecio } from '../../../shared/utils/formatoPrecio'
import { ProductoFormModal } from '../components/ProductoFormModal'
import { StockCell } from '../components/StockCell'
import { useProductos } from '../hooks/useProductos'
import { useActualizarStock, useEliminarProducto } from '../hooks/useProductosMutations'
import type { Producto } from '../types'

// El PDF pide paginación del lado del cliente: el panel trae hasta 100 productos (máximo de la API).
const LIMIT = 100

export function AdminProductosPage() {
  const productos = useProductos({ pagina: 1, limit: LIMIT })
  const eliminar = useEliminarProducto()
  const actualizar = useActualizarStock()
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [aBorrar, setABorrar] = useState<Producto | null>(null)

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: 'nombre', header: 'Nombre' },
      { id: 'categoria', header: 'Categoría', cell: ({ row }) => row.original.categoria.nombre },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ row }) => formatoPrecio(row.original.precio_base),
      },
      {
        id: 'stock',
        header: 'Stock',
        // key: reinicia el input cuando el stock cambia desde el servidor
        cell: ({ row }) => (
          <StockCell key={`${row.original.id}-${row.original.stock}`} producto={row.original} />
        ),
      },
      {
        id: 'disponible',
        header: 'Disponible',
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.original.disponible}
            aria-label={`Disponibilidad de ${row.original.nombre}`}
            disabled={actualizar.isPending}
            onChange={(e) =>
              actualizar.mutate({ id: row.original.id, cambios: { disponible: e.target.checked } })
            }
          />
        ),
      },
      {
        id: 'acciones',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variante="secundario"
              onClick={() => {
                setEditando(row.original)
                setFormAbierto(true)
              }}
            >
              Editar
            </Button>
            <Button variante="peligro" onClick={() => setABorrar(row.original)}>
              Dar de baja
            </Button>
          </div>
        ),
      },
    ],
    [actualizar],
  )

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button
          onClick={() => {
            setEditando(null)
            setFormAbierto(true)
          }}
        >
          Nuevo producto
        </Button>
      </div>

      {productos.isPending ? (
        <Skeleton className="h-64" />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio titulo="No hay productos" />
      ) : (
        <DataTable datos={productos.data.items} columnas={columnas} />
      )}

      <ProductoFormModal abierto={formAbierto} producto={editando} onCerrar={() => setFormAbierto(false)} />
      <ConfirmModal
        abierto={aBorrar !== null}
        titulo="Dar de baja producto"
        mensaje={`¿Dar de baja el producto "${aBorrar?.nombre ?? ''}"?`}
        textoConfirmar="Dar de baja"
        cargando={eliminar.isPending}
        onCerrar={() => setABorrar(null)}
        onConfirmar={() => {
          if (aBorrar) {
            eliminar.mutate(aBorrar.id, { onSettled: () => setABorrar(null) })
          }
        }}
      />
    </section>
  )
}
