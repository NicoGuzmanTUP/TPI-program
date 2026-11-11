from collections.abc import Sequence
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def get_by_id_for_update(self, pedido_id: int) -> Pedido | None:
        # Bloquea la fila para que dos cancelaciones no restituyan stock dos veces.
        consulta = select(Pedido).where(Pedido.id == pedido_id).with_for_update()
        return self.session.exec(consulta).first()

    def list_by_usuario(
        self,
        usuario_id: int | None,
        estado: str | None,
        skip: int,
        limit: int,
    ) -> tuple[int, Sequence[Pedido]]:
        """Con usuario_id en None lista los pedidos de todos los usuarios."""
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*filtros)
        ).one()
        items = self.session.exec(
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= desde)
        ).one()

    def sum_total_by_estado(self, estado: str) -> float:
        suma = self.session.exec(
            select(func.sum(Pedido.total)).where(Pedido.estado == estado)
        ).one()
        return float(suma or 0)
