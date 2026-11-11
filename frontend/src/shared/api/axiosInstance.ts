import axios, { AxiosError } from 'axios'

const SESION_DESACTIVADA = 'Cuenta de usuario desactivada'

let onSesionExpirada: (() => void) | null = null

/** Registra el callback que se ejecuta cuando la sesión deja de ser válida. */
export function setOnSesionExpirada(fn: (() => void) | null): void {
  onSesionExpirada = fn
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (error instanceof AxiosError && error.response) {
      const url = error.config?.url ?? ''
      const { status, data } = error.response
      const esAuth = url.includes('/auth/token') || url.includes('/auth/me')
      const detail = (data as { detail?: unknown } | undefined)?.detail
      const desactivada = status === 400 && detail === SESION_DESACTIVADA
      // /auth/token y /auth/me manejan sus propios errores en la pantalla de login
      if (!esAuth && (status === 401 || desactivada)) {
        onSesionExpirada?.()
      }
    }
    return Promise.reject(error)
  },
)
