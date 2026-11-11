import { Suspense, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Skeleton } from '../components/Skeleton'
import { Navbar } from './Navbar'

const enlaces = [
  { to: '/admin/resumen', etiqueta: 'Resumen', end: false },
  { to: '/admin/categorias', etiqueta: 'Categorías', end: false },
  { to: '/admin/productos', etiqueta: 'Productos', end: false },
  { to: '/admin/pedidos', etiqueta: 'Pedidos', end: false },
  { to: '/admin/usuarios', etiqueta: 'Usuarios', end: false },
]

export function AdminLayout() {
  const [abierta, setAbierta] = useState(false)

  return (
    <>
      <Navbar />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row">
        <button
          type="button"
          className="self-start rounded-full border border-borde bg-white px-4 py-2 text-sm font-medium md:hidden"
          onClick={() => setAbierta((v) => !v)}
          aria-expanded={abierta}
        >
          {abierta ? 'Cerrar menú' : 'Menú de administración'}
        </button>
        <aside className={`${abierta ? 'block' : 'hidden'} md:block md:w-52 md:shrink-0`}>
          <nav className="flex flex-col gap-1 rounded-3xl border border-borde bg-white p-3 md:sticky md:top-20">
            {enlaces.map((e) => (
              <NavLink
                key={e.to}
                to={e.to}
                end={e.end}
                onClick={() => setAbierta(false)}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium ${
                    isActive ? 'bg-tomate text-white' : 'hover:bg-crema-oscuro'
                  }`
                }
              >
                {e.etiqueta}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Suspense fallback={<Skeleton className="h-64" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </>
  )
}
