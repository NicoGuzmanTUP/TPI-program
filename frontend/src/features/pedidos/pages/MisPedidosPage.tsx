import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatoPrecio } from '../../../shared/utils/formatoPrecio'
import { PedidoDetalleModal } from '../components/PedidoDetalleModal'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types'

const LIMIT = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(1)
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null)
  const pedidos = usePedidos({ pagina, limit: LIMIT })
  const cancelar = useCancelarPedido()
  const usuarioId = useAuthStore((s) => s.usuario?.id)

  const onCancelar = (pedido: Pedido) => {
    cancelar.mutate(pedido.id, { onSuccess: () => setSeleccionado(null) })
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Mis pedidos</h1>
      {pedidos.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio titulo="Todavía no hiciste pedidos" />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pedidos.data.items.map((p) => (
              <Card key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-32 flex-1">
                  <h2 className="font-semibold">Pedido #{p.id}</h2>
                  <p className="text-sm text-tinta-suave">
                    {new Date(p.created_at).toLocaleString('es-AR')}
                  </p>
                </div>
                <BadgeEstado estado={p.estado} />
                <span className="w-28 text-right font-bold">{formatoPrecio(p.total)}</span>
                <Button variante="secundario" onClick={() => setSeleccionado(p)}>
                  Ver detalle
                </Button>
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} total={pedidos.data.total} limit={LIMIT} onCambiar={setPagina} />
        </>
      )}
      <PedidoDetalleModal
        pedido={seleccionado}
        onCerrar={() => setSeleccionado(null)}
        // el admin ve todos los pedidos, pero solo puede cancelar los propios aquí
        onCancelar={seleccionado?.usuario_id === usuarioId ? onCancelar : undefined}
        cancelando={cancelar.isPending}
      />
    </section>
  )
}
