import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'
import { formatoPrecio } from '../../../shared/utils/formatoPrecio'
import { PedidoDetalleModal } from '../components/PedidoDetalleModal'
import { useUsuarios } from '../../usuarios/hooks/useUsuarios'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido, Pedido } from '../types'

const LIMIT = 10

// Espeja TRANSICIONES de backend/app/modules/pedidos/service.py
const SIGUIENTE: Partial<Record<EstadoPedido, { estado: EstadoPedido; texto: string }>> = {
  PENDIENTE: { estado: 'EN_PREPARACION', texto: 'Preparar' },
  EN_PREPARACION: { estado: 'ENTREGADO', texto: 'Entregar' },
}

const ESTADOS: { valor: EstadoPedido; etiqueta: string }[] = [
  { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
  { valor: 'EN_PREPARACION', etiqueta: 'En preparación' },
  { valor: 'ENTREGADO', etiqueta: 'Entregado' },
  { valor: 'CANCELADO', etiqueta: 'Cancelado' },
]

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(1)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const pedidos = usePedidos({ pagina, limit: LIMIT, estado })
  const cambiar = useCambiarEstadoPedido()
  const usuarios = useUsuarios()
  const usuariosPorId = useMemo(
    () => new Map((usuarios.data ?? []).map((u) => [u.id, u])),
    [usuarios.data],
  )

  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { id: 'id', header: 'Pedido', cell: ({ row }) => `#${row.original.id}` },
      {
        id: 'cliente',
        header: 'Cliente',
        cell: ({ row }) => {
          const u = usuariosPorId.get(row.original.usuario_id)
          if (!u) return `#${row.original.usuario_id}`
          return (
            <div>
              <div className="font-medium">{u.full_name}</div>
              <div className="text-xs text-tinta-suave">{u.username}</div>
            </div>
          )
        },
      },
      {
        id: 'fecha',
        header: 'Fecha',
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString('es-AR'),
      },
      { id: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
      { id: 'total', header: 'Total', cell: ({ row }) => formatoPrecio(row.original.total) },
      {
        id: 'acciones',
        header: '',
        cell: ({ row }) => {
          const p = row.original
          const siguiente = SIGUIENTE[p.estado]
          return (
            <div className="flex justify-end gap-2">
              <Button variante="secundario" onClick={() => setDetalle(p)}>
                Detalle
              </Button>
              {siguiente && (
                <Button
                  disabled={cambiar.isPending}
                  onClick={() => cambiar.mutate({ id: p.id, estado: siguiente.estado })}
                >
                  {siguiente.texto}
                </Button>
              )}
              {siguiente && (
                <Button variante="peligro" onClick={() => setACancelar(p)}>
                  Cancelar
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [cambiar, usuariosPorId],
  )

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select
          value={estado ?? ''}
          onChange={(e) => {
            setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)
            setPagina(1)
          }}
          aria-label="Filtrar por estado"
          className="rounded-full border border-borde bg-white px-4 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {pedidos.isPending ? (
        <Skeleton className="h-64" />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio titulo="No hay pedidos" />
      ) : (
        <>
          <DataTable datos={pedidos.data.items} columnas={columnas} paginar={false} />
          <Paginacion pagina={pagina} total={pedidos.data.total} limit={LIMIT} onCambiar={setPagina} />
        </>
      )}

      <PedidoDetalleModal
        pedido={detalle}
        cliente={detalle ? usuariosPorId.get(detalle.usuario_id) : undefined}
        onCerrar={() => setDetalle(null)}
      />
      <ConfirmModal
        abierto={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido #${aCancelar?.id ?? ''}? Se restituirá el stock.`}
        textoConfirmar="Cancelar pedido"
        cargando={cambiar.isPending}
        onCerrar={() => setACancelar(null)}
        onConfirmar={() => {
          if (aCancelar) {
            cambiar.mutate(
              { id: aCancelar.id, estado: 'CANCELADO' },
              { onSettled: () => setACancelar(null) },
            )
          }
        }}
      />
    </section>
  )
}
