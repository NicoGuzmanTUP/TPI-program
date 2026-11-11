from sqlalchemy.exc import IntegrityError

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [
                CategoriaRead.model_validate(categoria)
                for categoria in uow.categorias.list_activas()
            ]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(
                self._obtener_activa(uow, categoria_id)
            )

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(datos.nombre) is not None:
                raise NombreDuplicado()
            categoria = Categoria.model_validate(datos.model_dump())
            return CategoriaRead.model_validate(self._guardar(uow, categoria))

    def actualizar(
        self, categoria_id: int, datos: CategoriaUpdate
    ) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            cambios = datos.model_dump(exclude_unset=True)
            nombre = cambios.get("nombre")
            if nombre is not None:
                existente = uow.categorias.get_by_nombre(nombre)
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado()
            categoria.sqlmodel_update(cambios)
            return CategoriaRead.model_validate(self._guardar(uow, categoria))

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _obtener_activa(
        uow: CategoriaUnitOfWork, categoria_id: int
    ) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada()
        return categoria

    @staticmethod
    def _guardar(uow: CategoriaUnitOfWork, categoria: Categoria) -> Categoria:
        try:
            return uow.categorias.add(categoria)
        except IntegrityError as error:
            # Dos escrituras simultáneas pueden pasar la comprobación previa.
            raise NombreDuplicado() from error
