from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import MessageResponse
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])

COOKIE_NAME = "access_token"


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post(
    "/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED
)
def registrar(datos: UserCreate, service: ServiceDep) -> UserPublic:
    try:
        return service.registrar(datos)
    except UsuarioDuplicado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El username o el email ya existen",
        )


@router.post("/token", response_model=MessageResponse)
def login(
    response: Response,
    formulario: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: ServiceDep,
) -> MessageResponse:
    try:
        token = service.login(formulario.username, formulario.password)
    except CredencialesInvalidas:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
        )
    except CuentaDesactivada:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    # secure=False solo sirve en desarrollo sobre HTTP; con HTTPS debe ser True.
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(key=COOKIE_NAME, path="/", samesite="lax", httponly=True)
    return MessageResponse(message="Logout exitoso")


@router.get("/me", response_model=UserPublic)
def perfil(
    usuario: Annotated[UserPublic, Depends(get_current_active_user)],
) -> UserPublic:
    return usuario
