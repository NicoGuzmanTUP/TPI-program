import { AxiosError } from 'axios'

interface ErrorValidacion {
  loc?: (string | number)[]
  msg?: string
}

/** Devuelve el mensaje en español para mostrar en pantalla a partir de cualquier error. */
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (!error.response) return 'No se pudo conectar con el servidor'
    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return (detail as ErrorValidacion[])
        .map((e) => {
          const campo = e.loc?.filter((p) => p !== 'body').join('.')
          return campo ? `${campo}: ${e.msg ?? 'inválido'}` : (e.msg ?? 'inválido')
        })
        .join('; ')
    }
    return 'Ocurrió un error inesperado'
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}
