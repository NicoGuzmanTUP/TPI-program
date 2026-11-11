import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { ButtonLink } from '../../../shared/ui/ButtonLink'

export function UnauthorizedPage() {
  return (
    <EstadoVacio
      titulo="Acceso no autorizado"
      descripcion="No tenés permisos para ver esta página."
      accion={<ButtonLink to="/">Volver al catálogo</ButtonLink>}
    />
  )
}
