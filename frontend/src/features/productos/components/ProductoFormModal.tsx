import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useState } from 'react'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'
import { Modal } from '../../../shared/ui/Modal'
import { errorCampo } from '../../../shared/utils/errorCampo'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { useGuardarProducto } from '../hooks/useProductosMutations'
import type { Producto } from '../types'
import { productoSchema } from '../types/schemas'

interface Props {
  abierto: boolean
  producto: Producto | null
  onCerrar: () => void
}

export function ProductoFormModal({ abierto, producto, onCerrar }: Props) {
  if (!abierto) return null
  // key: reinicia el formulario al cambiar de producto
  return <Contenido key={producto?.id ?? 'nuevo'} producto={producto} onCerrar={onCerrar} />
}

function Contenido({ producto, onCerrar }: { producto: Producto | null; onCerrar: () => void }) {
  const guardar = useGuardarProducto()
  const [confirmandoSalida, setConfirmandoSalida] = useState(false)
  const categorias = useCategorias()
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? 0,
    },
    validators: { onSubmit: productoSchema },
    onSubmit: async ({ value }) => {
      try {
        await guardar.mutateAsync({
          id: producto?.id,
          datos: {
            ...value,
            descripcion: value.descripcion || null,
            imagen_url: value.imagen_url || null,
          },
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

  const estiloCampo =
    'rounded-xl border border-borde bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tomate/40'

  return (
    <>
    <Modal abierto titulo={producto ? 'Editar producto' : 'Nuevo producto'} onCerrar={intentarCerrar}>
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
              className={estiloCampo}
            />
          </div>
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="precio_base">
          {(field) => (
            <Input
              id="precio_base"
              type="number"
              min={0}
              step="0.01"
              label="Precio"
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={errorCampo(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="stock">
          {(field) => (
            <Input
              id="stock"
              type="number"
              min={0}
              step={1}
              label="Stock"
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={errorCampo(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </div>
      <form.Field name="categoria_id">
        {(field) => {
          const error = errorCampo(field.state.meta.errors)
          return (
            <div className="flex flex-col gap-1">
              <label htmlFor="categoria_id" className="text-sm font-medium">
                Categoría
              </label>
              <select
                id="categoria_id"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className={estiloCampo}
              >
                <option value={0}>Elegí una categoría</option>
                {categorias.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {error && <span className="text-xs text-red-700">{error}</span>}
            </div>
          )
        }}
      </form.Field>
      <form.Field name="imagen_url">
        {(field) => (
          <Input
            id="imagen_url"
            label="URL de imagen (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={errorCampo(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible
          </label>
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
