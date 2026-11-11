import type { ButtonHTMLAttributes } from 'react'
import { estilosBoton } from './buttonStyles'
import type { VarianteBoton } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton
  cargando?: boolean
}

export function Button({
  variante = 'primario',
  cargando = false,
  disabled,
  className = '',
  children,
  ...resto
}: ButtonProps) {
  return (
    <button disabled={disabled || cargando} className={estilosBoton(variante, className)} {...resto}>
      {cargando ? 'Cargando...' : children}
    </button>
  )
}
