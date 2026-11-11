import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  /** Stock conocido al agregar; tope de la cantidad en el carrito. */
  stock: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (item: Omit<ItemCarrito, 'cantidad'>, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (item, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === item.producto_id)
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === item.producto_id
                  ? {
                      ...i,
                      stock: item.stock,
                      cantidad: Math.min(i.cantidad + cantidad, item.stock),
                    }
                  : i,
              ),
            }
          }
          const inicial = Math.min(cantidad, item.stock)
          if (inicial < 1) return state
          return { items: [...state.items, { ...item, cantidad: inicial }] }
        }),
      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),
      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items:
            cantidad < 1
              ? state.items.filter((i) => i.producto_id !== productoId)
              : state.items.map((i) =>
                  i.producto_id === productoId
                    ? { ...i, cantidad: Math.min(cantidad, i.stock) }
                    : i,
                ),
        })),
      vaciar: () => set({ items: [] }),
      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
    }),
    {
      name: 'carrito',
      // v1: los ítems guardan `stock`. Los carritos anteriores (sin stock) se descartan.
      version: 1,
      migrate: (_estadoViejo, version) => {
        if (version < 1) return { items: [] }
        return _estadoViejo as { items: ItemCarrito[] }
      },
    },
  ),
)
