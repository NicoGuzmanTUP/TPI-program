import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage'
import { CarritoPage } from '../features/pedidos/pages/CarritoPage'
import { CheckoutPage } from '../features/pedidos/pages/CheckoutPage'
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage'
import { CatalogoPage } from '../features/productos/pages/CatalogoPage'
import { MainLayout } from '../shared/layout/MainLayout'
import { Skeleton } from '../shared/components/Skeleton'
import { ProtectedRoute } from './ProtectedRoute'

// El panel de administración se carga bajo demanda para achicar el bundle principal.
const AdminLayout = lazy(() =>
  import('../shared/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminResumenPage = lazy(() =>
  import('../features/pedidos/pages/AdminResumenPage').then((m) => ({ default: m.AdminResumenPage })),
)
const AdminCategoriasPage = lazy(() =>
  import('../features/categorias/pages/AdminCategoriasPage').then((m) => ({
    default: m.AdminCategoriasPage,
  })),
)
const AdminProductosPage = lazy(() =>
  import('../features/productos/pages/AdminProductosPage').then((m) => ({
    default: m.AdminProductosPage,
  })),
)
const AdminPedidosPage = lazy(() =>
  import('../features/pedidos/pages/AdminPedidosPage').then((m) => ({ default: m.AdminPedidosPage })),
)
const AdminUsuariosPage = lazy(() =>
  import('../features/usuarios/pages/AdminUsuariosPage').then((m) => ({
    default: m.AdminUsuariosPage,
  })),
)

function Cargando() {
  return <Skeleton className="m-6 h-64" />
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<CatalogoPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="carrito" element={<CarritoPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="mis-pedidos" element={<MisPedidosPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route
          path="admin"
          element={
            <Suspense fallback={<Cargando />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<Navigate to="resumen" replace />} />
          <Route path="resumen" element={<AdminResumenPage />} />
          <Route path="categorias" element={<AdminCategoriasPage />} />
          <Route path="productos" element={<AdminProductosPage />} />
          <Route path="pedidos" element={<AdminPedidosPage />} />
          <Route path="usuarios" element={<AdminUsuariosPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
