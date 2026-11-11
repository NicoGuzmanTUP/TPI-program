import { useState } from 'react'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { handleApiError } from '../../../shared/api/handleApiError'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMIT = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const search = useDebounce(busqueda.trim(), 400)

  const categorias = useCategorias()
  const productos = useProductos({ pagina, limit: LIMIT, search, categoria_id: categoriaId })

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(1)
          }}
          placeholder="Buscar productos..."
          aria-label="Buscar productos"
          className="flex-1 rounded-full border border-borde bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-tomate/40"
        />
        <select
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(1)
          }}
          aria-label="Filtrar por categoría"
          className="rounded-full border border-borde bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-tomate/40"
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {productos.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: LIMIT }, (_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio titulo="Sin resultados" descripcion="Probá con otra búsqueda o categoría." />
      ) : (
        <>
          <div
            className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${productos.isPlaceholderData ? 'opacity-60' : ''}`}
          >
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            total={productos.data.total}
            limit={LIMIT}
            onCambiar={setPagina}
          />
        </>
      )}
    </section>
  )
}
