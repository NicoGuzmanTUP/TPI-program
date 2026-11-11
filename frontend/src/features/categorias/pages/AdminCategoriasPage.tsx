import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'
import { CategoriaFormModal } from '../components/CategoriaFormModal'
import { useCategorias } from '../hooks/useCategorias'
import { useEliminarCategoria } from '../hooks/useCategoriasMutations'
import type { Categoria } from '../types'

export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const eliminar = useEliminarCategoria()
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [aBorrar, setABorrar] = useState<Categoria | null>(null)

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => row.original.descripcion ?? '—',
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
    [],
  )

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button
          onClick={() => {
            setEditando(null)
            setFormAbierto(true)
          }}
        >
          Nueva categoría
        </Button>
      </div>

      {categorias.isPending ? (
        <Skeleton className="h-48" />
      ) : categorias.isError ? (
        <EstadoError mensaje={handleApiError(categorias.error)} onReintentar={() => void categorias.refetch()} />
      ) : categorias.data.length === 0 ? (
        <EstadoVacio titulo="No hay categorías" />
      ) : (
        <DataTable datos={categorias.data} columnas={columnas} />
      )}

      <CategoriaFormModal
        abierto={formAbierto}
        categoria={editando}
        onCerrar={() => setFormAbierto(false)}
      />
      <ConfirmModal
        abierto={aBorrar !== null}
        titulo="Dar de baja categoría"
        mensaje={`¿Dar de baja la categoría "${aBorrar?.nombre ?? ''}"?`}
        textoConfirmar="Dar de baja"
        cargando={eliminar.isPending}
        onCerrar={() => setABorrar(null)}
        onConfirmar={() => {
          if (aBorrar) eliminar.mutate(aBorrar.id, { onSettled: () => setABorrar(null) })
        }}
      />
    </section>
  )
}
