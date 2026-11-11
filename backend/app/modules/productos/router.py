from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/productos", tags=["Productos"])

AdminDep = Annotated[UserPublic, Depends(require_role(["admin"]))]


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]

PRODUCTO_NO_ENCONTRADO = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
)
CATEGORIA_NO_ENCONTRADA = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada"
)


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado:
        raise PRODUCTO_NO_ENCONTRADO


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    datos: ProductoCreate, _: AdminDep, service: ServiceDep
) -> ProductoRead:
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada:
        raise CATEGORIA_NO_ENCONTRADA


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    _: AdminDep,
    service: ServiceDep,
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, datos)
    except ProductoNoEncontrado:
        raise PRODUCTO_NO_ENCONTRADO
    except CategoriaNoEncontrada:
        raise CATEGORIA_NO_ENCONTRADA


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    _: AdminDep,
    service: ServiceDep,
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado:
        raise PRODUCTO_NO_ENCONTRADO


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int, _: AdminDep, service: ServiceDep
) -> None:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado:
        raise PRODUCTO_NO_ENCONTRADO
