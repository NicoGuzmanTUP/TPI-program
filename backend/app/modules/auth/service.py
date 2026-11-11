from sqlalchemy.exc import IntegrityError

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(Exception):
    pass


class CredencialesInvalidas(Exception):
    pass


class CuentaDesactivada(Exception):
    pass


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        with self.uow as uow:
            if (
                uow.usuarios.get_by_username(datos.username) is not None
                or uow.usuarios.get_by_email(datos.email) is not None
            ):
                raise UsuarioDuplicado()
            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=datos.email,
                hashed_password=hash_password(datos.password),
                role="user",
            )
            try:
                uow.usuarios.add(usuario)
            except IntegrityError as error:
                # Dos registros simultáneos pueden pasar la comprobación previa.
                raise UsuarioDuplicado() from error
            return UserPublic.model_validate(usuario)

    def login(self, identificador: str, password: str) -> str:
        # El identificador puede ser el username o el email del usuario.
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(identificador)
            if usuario is None:
                usuario = uow.usuarios.get_by_email(identificador)
            if usuario is None or not verify_password(
                password, usuario.hashed_password
            ):
                raise CredencialesInvalidas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token(usuario.username)
