import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number
  total: number
  limit: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, total, limit, onCambiar }: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / limit))
  return (
    <nav className="flex items-center justify-center gap-4 py-4" aria-label="Paginación">
      <Button variante="secundario" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span className="text-sm text-tinta-suave">
        Página {pagina} de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        disabled={pagina >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </nav>
  )
}
