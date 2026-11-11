import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmModalProps {
  abierto: boolean
  titulo: string
  mensaje: string
  textoConfirmar?: string
  cargando?: boolean
  onConfirmar: () => void
  onCerrar: () => void
}

export function ConfirmModal({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  cargando = false,
  onConfirmar,
  onCerrar,
}: ConfirmModalProps) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCerrar}>
      <p className="mb-6 text-sm">{mensaje}</p>
      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button variante="peligro" cargando={cargando} onClick={onConfirmar}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}
