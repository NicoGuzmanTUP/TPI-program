from collections.abc import Callable
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(
    access_token: Annotated[str | None, Cookie()] = None,
) -> UserPublic:
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
    )
    if access_token is None:
        raise error
    username = decode_access_token(access_token)
    if username is None:
        raise error
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise error
        return UserPublic.model_validate(usuario)


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return usuario


def require_role(roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    def verificar_rol(
        usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para esta operación",
            )
        return usuario

    return verificar_rol
