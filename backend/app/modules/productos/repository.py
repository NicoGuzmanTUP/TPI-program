from collections.abc import Sequence

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_by_id_for_update(self, producto_id: int) -> Producto | None:
        # Bloquea la fila para que dos pedidos no descuenten el mismo stock.
        consulta = (
            select(Producto).where(Producto.id == producto_id).with_for_update()
        )
        return self.session.exec(consulta).first()

    def search(
        self,
        skip: int,
        limit: int,
        nombre: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, Sequence[Producto]]:
        filtros = [Producto.activo == True]  # noqa: E712
        if nombre:
            filtros.append(col(Producto.nombre).icontains(nombre, autoescape=True))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*filtros)
        ).one()
        items = self.session.exec(
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        ).all()
        return total, items
