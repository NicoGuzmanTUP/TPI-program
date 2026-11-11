import { Button } from '../ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">⚠️</span>
      <p className="text-sm text-red-700">{mensaje}</p>
      {onReintentar && (
        <Button variante="secundario" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
