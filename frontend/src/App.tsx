import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { setOnSesionExpirada } from './shared/api/axiosInstance'
import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  useEffect(() => {
    setOnSesionExpirada(() => {
      useAuthStore.getState().limpiarSesion()
      toast.error('Tu sesión expiró. Ingresá de nuevo.')
    })
    void checkSession()
    return () => setOnSesionExpirada(null)
  }, [checkSession])

  return (
    <>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </>
  )
}
