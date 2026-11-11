import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">🍽️</span>
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {descripcion && <p className="text-sm text-tinta-suave">{descripcion}</p>}
      {accion}
    </div>
  )
}
