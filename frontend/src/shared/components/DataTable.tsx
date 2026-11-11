import { useEffect } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '../ui/Button'

interface DataTableProps<T> {
  datos: T[]
  columnas: ColumnDef<T>[]
  porPagina?: number
  /** false cuando el servidor ya pagina: no se usa la paginación del cliente. */
  paginar?: boolean
}

/** Tabla (TanStack Table) con paginación del lado del cliente, desactivable con `paginar={false}`. */
export function DataTable<T>({ datos, columnas, porPagina = 10, paginar = true }: DataTableProps<T>) {
  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    ...(paginar ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    initialState: { pagination: { pageSize: porPagina } },
    // mantiene la página actual cuando cambian los datos (editar stock en la página 2, etc.)
    autoResetPageIndex: false,
  })

  // si la última página queda vacía (por una baja), vuelve a la última que existe
  const cantidadPaginas = tabla.getPageCount()
  const indicePagina = tabla.getState().pagination.pageIndex
  useEffect(() => {
    if (paginar && cantidadPaginas > 0 && indicePagina >= cantidadPaginas) {
      tabla.setPageIndex(cantidadPaginas - 1)
    }
  }, [paginar, cantidadPaginas, indicePagina, tabla])

  return (
    <div>
      <div className="overflow-x-auto rounded-3xl border border-borde bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-crema-oscuro text-xs uppercase text-tinta-suave">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3 font-semibold">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-borde">
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id}>
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3 align-middle">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginar && tabla.getPageCount() > 1 && (
        <nav className="flex items-center justify-center gap-4 py-4" aria-label="Paginación">
          <Button
            variante="secundario"
            disabled={!tabla.getCanPreviousPage()}
            onClick={() => tabla.previousPage()}
          >
            Anterior
          </Button>
          <span className="text-sm text-tinta-suave">
            Página {tabla.getState().pagination.pageIndex + 1} de {tabla.getPageCount()}
          </span>
          <Button
            variante="secundario"
            disabled={!tabla.getCanNextPage()}
            onClick={() => tabla.nextPage()}
          >
            Siguiente
          </Button>
        </nav>
      )}
    </div>
  )
}
