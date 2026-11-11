import type { Categoria } from '../../categorias/types'

// Espeja ProductoRead y ProductosPaginados de backend/app/modules/productos/schemas.py
export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria_id: number
  categoria: Categoria
}

export interface ProductosPaginados {
  total: number
  items: Producto[]
}

export interface FiltrosProductos {
  pagina: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}
