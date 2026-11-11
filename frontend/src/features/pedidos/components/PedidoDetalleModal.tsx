import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatoPrecio } from '../../../shared/utils/formatoPrecio'
import type { Pedido } from '../types'

export interface ClientePedido {
  username: string
  full_name: string
  email: string
}

interface PedidoDetalleModalProps {
  pedido: Pedido | null
  cliente?: ClientePedido
  onCerrar: () => void
  onCancelar?: (pedido: Pedido) => void
  cancelando?: boolean
}

export function PedidoDetalleModal({
  pedido,
  cliente,
  onCerrar,
  onCancelar,
  cancelando = false,
}: PedidoDetalleModalProps) {
  return (
    <Modal abierto={pedido !== null} titulo={pedido ? `Pedido #${pedido.id}` : ''} onCerrar={onCerrar}>
      {pedido && (
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center justify-between">
            <BadgeEstado estado={pedido.estado} />
            <span className="text-tinta-suave">
              {new Date(pedido.created_at).toLocaleString('es-AR')}
            </span>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            {cliente && (
              <>
                <dt className="font-medium">Cliente</dt>
                <dd>
                  {cliente.full_name} ({cliente.username})
                  <br />
                  <span className="text-tinta-suave">{cliente.email}</span>
                </dd>
              </>
            )}
            <dt className="font-medium">Dirección</dt>
            <dd>{pedido.direccion_entrega}</dd>
            <dt className="font-medium">Pago</dt>
            <dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
            {pedido.notas && (
              <>
                <dt className="font-medium">Notas</dt>
                <dd>{pedido.notas}</dd>
              </>
            )}
          </dl>
          <ul className="divide-y divide-borde rounded-2xl border border-borde bg-white">
            {pedido.items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-2 px-3 py-2">
                <span>
                  {item.cantidad} × {item.nombre_producto}
                </span>
                <span className="font-medium">{formatoPrecio(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">Total: {formatoPrecio(pedido.total)}</span>
            {onCancelar && pedido.estado === 'PENDIENTE' && (
              <Button variante="peligro" cargando={cancelando} onClick={() => onCancelar(pedido)}>
                Cancelar pedido
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
