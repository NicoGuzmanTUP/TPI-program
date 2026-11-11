from collections.abc import Sequence

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        # Incluye las dadas de baja: la baja lógica no libera el nombre.
        consulta = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(consulta).first()

    def list_activas(self) -> Sequence[Categoria]:
        consulta = (
            select(Categoria)
            .where(Categoria.activo == True)  # noqa: E712
            .order_by(Categoria.nombre)
        )
        return self.session.exec(consulta).all()
