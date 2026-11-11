import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const estiloLink = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium hover:text-tomate ${isActive ? 'text-tomate' : 'text-tinta'}`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-crema/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-xl font-bold text-tomate">
          🍅 Food Store
        </Link>
        <nav className="flex items-center gap-5">
          <NavLink to="/" end className={estiloLink}>
            Catálogo
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={estiloLink}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <NavLink to="/admin" className={estiloLink}>
              Admin
            </NavLink>
          )}
          <NavLink to="/carrito" className={estiloLink}>
            Carrito{cantidad > 0 && ` (${cantidad})`}
          </NavLink>
          {usuario ? (
            <>
              <span className="hidden text-sm text-tinta-suave sm:inline">
                {usuario.full_name}{' '}
                <span className="rounded-full bg-crema-oscuro px-2 py-0.5 text-xs font-semibold">
                  {usuario.role === 'admin' ? 'Admin' : 'Cliente'}
                </span>
              </span>
              <Button variante="secundario" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={estiloLink}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={estiloLink}>
                Registrarse
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
