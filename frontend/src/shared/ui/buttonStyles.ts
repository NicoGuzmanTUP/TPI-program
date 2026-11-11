export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const variantes: Record<VarianteBoton, string> = {
  primario: 'bg-tomate text-white hover:bg-tomate-oscuro',
  secundario: 'border border-borde bg-white text-tinta hover:bg-crema-oscuro',
  peligro: 'bg-red-700 text-white hover:bg-red-800',
  fantasma: 'text-tinta hover:bg-crema-oscuro',
}

/** Clases compartidas por Button y ButtonLink. */
export function estilosBoton(variante: VarianteBoton, className = ''): string {
  return `${base} ${variantes[variante]} ${className}`
}
