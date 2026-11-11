from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    pass


class AutoDesactivacion(Exception):
    pass


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [
                UserPublic.model_validate(usuario)
                for usuario in uow.usuarios.list_ordenados()
            ]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            usuario.disabled = False
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            if usuario.id == admin_id:
                raise AutoDesactivacion()
            usuario.disabled = True
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    @staticmethod
    def _obtener(uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise UsuarioNoEncontrado()
        return usuario
