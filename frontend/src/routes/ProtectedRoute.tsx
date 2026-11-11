import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Rol } from '../features/auth/types'

interface ProtectedRouteProps {
  roles?: Rol[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)

  if (cargando) {
    return <div className="py-16 text-center text-sm text-tinta-suave">Cargando sesión...</div>
  }
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
