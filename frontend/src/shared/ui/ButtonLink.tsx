import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'
import { estilosBoton } from './buttonStyles'
import type { VarianteBoton } from './buttonStyles'

interface ButtonLinkProps extends LinkProps {
  variante?: VarianteBoton
}

/** Enlace con el aspecto de un Button (evita anidar <button> dentro de <a>). */
export function ButtonLink({ variante = 'primario', className = '', ...resto }: ButtonLinkProps) {
  return <Link className={estilosBoton(variante, className)} {...resto} />
}
