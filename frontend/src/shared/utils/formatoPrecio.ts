const formato = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

export function formatoPrecio(valor: number): string {
  return formato.format(valor)
}
