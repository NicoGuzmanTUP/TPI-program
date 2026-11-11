// Espeja CategoriaRead de backend/app/modules/categorias/schemas.py
export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}
