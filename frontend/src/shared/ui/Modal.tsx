import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

// Pila de modales abiertos: con uno encima de otro, Escape cierra solo el de arriba.
const pila: string[] = []

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
}

export function Modal({ abierto, titulo, onCerrar, children }: ModalProps) {
  const id = useId()
  const onCerrarRef = useRef(onCerrar)

  useEffect(() => {
    onCerrarRef.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    if (!abierto) return
    pila.push(id)
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pila[pila.length - 1] === id) onCerrarRef.current()
    }
    window.addEventListener('keydown', alTeclear)
    return () => {
      window.removeEventListener('keydown', alTeclear)
      const i = pila.indexOf(id)
      if (i !== -1) pila.splice(i, 1)
    }
  }, [abierto, id])

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-crema p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-full px-2 text-xl text-tinta-suave hover:bg-crema-oscuro"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
