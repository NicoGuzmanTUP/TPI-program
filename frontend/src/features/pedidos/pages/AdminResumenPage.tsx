import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Card } from '../../../shared/ui/Card'
import { formatoPrecio } from '../../../shared/utils/formatoPrecio'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const resumen = useResumenPedidos()

  if (resumen.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }
  if (resumen.isError) {
    return <EstadoError mensaje={handleApiError(resumen.error)} onReintentar={() => void resumen.refetch()} />
  }

  const r = resumen.data
  const tarjetas = [
    { titulo: 'Pendientes', valor: String(r.pendientes) },
    { titulo: 'En preparación', valor: String(r.en_preparacion) },
    { titulo: 'Entregados', valor: String(r.entregados) },
    { titulo: 'Cancelados', valor: String(r.cancelados) },
    { titulo: 'Pedidos de hoy', valor: String(r.pedidos_hoy) },
    { titulo: 'Ingresos (entregados)', valor: formatoPrecio(r.ingresos_entregados) },
  ]

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Resumen</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((t) => (
          <Card key={t.titulo} className="p-5">
            <p className="text-sm text-tinta-suave">{t.titulo}</p>
            <p className="mt-1 text-3xl font-bold text-tomate">{t.valor}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
