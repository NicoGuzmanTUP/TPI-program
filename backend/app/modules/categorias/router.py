from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/categorias", tags=["Categorías"])

AdminDep = Annotated[UserPublic, Depends(require_role(["admin"]))]


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]

NO_ENCONTRADA = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada"
)
DUPLICADA = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail="Ya existe una categoría con ese nombre",
)


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada:
        raise NO_ENCONTRADA


@router.post(
    "", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED
)
def crear_categoria(
    datos: CategoriaCreate, _: AdminDep, service: ServiceDep
) -> CategoriaRead:
    try:
        return service.crear(datos)
    except NombreDuplicado:
        raise DUPLICADA


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    _: AdminDep,
    service: ServiceDep,
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada:
        raise NO_ENCONTRADA
    except NombreDuplicado:
        raise DUPLICADA


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    categoria_id: int, _: AdminDep, service: ServiceDep
) -> None:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada:
        raise NO_ENCONTRADA
