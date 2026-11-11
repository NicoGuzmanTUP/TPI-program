export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'

const estilos: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

const etiquetas: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${estilos[estado]}`}>
      {etiquetas[estado]}
    </span>
  )
}
