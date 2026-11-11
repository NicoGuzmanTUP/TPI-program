import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import type { Usuario } from '../../auth/types'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'

export function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const cambiar = useCambiarEstadoUsuario()
  const propioId = useAuthStore((s) => s.usuario?.id)

  const columnas = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario' },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Rol' },
      {
        id: 'estado',
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              row.original.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {row.original.disabled ? 'Desactivado' : 'Activo'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: '',
        cell: ({ row }) => {
          const u = row.original
          if (u.disabled) {
            return (
              <div className="flex justify-end">
                <Button
                  disabled={cambiar.isPending}
                  onClick={() => cambiar.mutate({ id: u.id, activar: true })}
                >
                  Activar
                </Button>
              </div>
            )
          }
          if (u.id === propioId) return null
          return (
            <div className="flex justify-end">
              <Button
                variante="peligro"
                disabled={cambiar.isPending}
                onClick={() => cambiar.mutate({ id: u.id, activar: false })}
              >
                Desactivar
              </Button>
            </div>
          )
        },
      },
    ],
    [cambiar, propioId],
  )

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>
      {usuarios.isPending ? (
        <Skeleton className="h-64" />
      ) : usuarios.isError ? (
        <EstadoError mensaje={handleApiError(usuarios.error)} onReintentar={() => void usuarios.refetch()} />
      ) : usuarios.data.length === 0 ? (
        <EstadoVacio titulo="No hay usuarios" />
      ) : (
        <DataTable datos={usuarios.data} columnas={columnas} />
      )}
    </section>
  )
}
