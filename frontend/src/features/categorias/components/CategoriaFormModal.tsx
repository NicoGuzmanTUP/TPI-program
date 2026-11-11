import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useState } from 'react'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'
import { Modal } from '../../../shared/ui/Modal'
import { errorCampo } from '../../../shared/utils/errorCampo'
import { useGuardarCategoria } from '../hooks/useCategoriasMutations'
import type { Categoria } from '../types'
import { categoriaSchema } from '../types/schemas'

interface Props {
  abierto: boolean
  categoria: Categoria | null
  onCerrar: () => void
}

export function CategoriaFormModal({ abierto, categoria, onCerrar }: Props) {
  if (!abierto) return null
  // key: reinicia el formulario al cambiar de categoría
  return <Contenido key={categoria?.id ?? 'nueva'} categoria={categoria} onCerrar={onCerrar} />
}

function Contenido({ categoria, onCerrar }: { categoria: Categoria | null; onCerrar: () => void }) {
  const guardar = useGuardarCategoria()
  const [confirmandoSalida, setConfirmandoSalida] = useState(false)
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    validators: { onSubmit: categoriaSchema },
    onSubmit: async ({ value }) => {
      try {
        await guardar.mutateAsync({
          id: categoria?.id,
          datos: { nombre: value.nombre, descripcion: value.descripcion || null },
        })
        onCerrar()
      } catch {
        // el toast lo muestra el hook; el modal queda abierto
      }
    },
  })

  // Cierra directo si no hay cambios; si los hay, pide confirmación.
  const intentarCerrar = () => {
    if (form.state.isDefaultValue) onCerrar()
    else setConfirmandoSalida(true)
  }

  return (
    <>
    <Modal abierto titulo={categoria ? 'Editar categoría' : 'Nueva categoría'} onCerrar={intentarCerrar}>
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="nombre">
        {(field) => (
          <Input
            id="nombre"
            label="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={errorCampo(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="descripcion" className="text-sm font-medium">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              rows={3}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded-xl border border-borde bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tomate/40"
            />
          </div>
        )}
      </form.Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variante="secundario" onClick={intentarCerrar}>
          Cancelar
        </Button>
        <Button type="submit" cargando={guardar.isPending}>
          Guardar
        </Button>
      </div>
    </form>
    </Modal>
    <ConfirmModal
      abierto={confirmandoSalida}
      titulo="Cambios sin guardar"
      mensaje="Hay cambios sin guardar. ¿Salir sin guardar?"
      textoConfirmar="Salir sin guardar"
      onCerrar={() => setConfirmandoSalida(false)}
      onConfirmar={onCerrar}
    />
    </>
  )
}
