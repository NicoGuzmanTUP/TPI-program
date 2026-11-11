from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios"])

AdminDep = Annotated[UserPublic, Depends(require_role(["admin"]))]


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]

NO_ENCONTRADO = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
)


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_: AdminDep, service: ServiceDep) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int, _: AdminDep, service: ServiceDep
) -> UserPublic:
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado:
        raise NO_ENCONTRADO


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int, admin: AdminDep, service: ServiceDep
) -> UserPublic:
    try:
        return service.desactivar(usuario_id, admin.id)
    except UsuarioNoEncontrado:
        raise NO_ENCONTRADO
    except AutoDesactivacion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede desactivar su propia cuenta",
        )
