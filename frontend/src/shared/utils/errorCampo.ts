/** Extrae el primer mensaje de error de un campo de TanStack Form (issues de Zod). */
export function errorCampo(errores: unknown[]): string | undefined {
  const primero = errores[0]
  if (!primero) return undefined
  if (typeof primero === 'string') return primero
  if (typeof primero === 'object' && 'message' in primero) {
    return String((primero as { message: unknown }).message)
  }
  return undefined
}
