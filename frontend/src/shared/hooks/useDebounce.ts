import { useEffect, useState } from 'react'

/** Devuelve `valor` solo después de `retrasoMs` sin cambios. */
export function useDebounce<T>(valor: T, retrasoMs: number): T {
  const [debounced, setDebounced] = useState(valor)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(valor), retrasoMs)
    return () => clearTimeout(id)
  }, [valor, retrasoMs])
  return debounced
}
