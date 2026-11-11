from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        consulta = select(self.model).offset(skip).limit(limit)
        return self.session.exec(consulta).all()

    def add(self, entidad: T) -> T:
        # flush envía el INSERT o UPDATE y obtiene el id sin hacer commit.
        self.session.add(entidad)
        self.session.flush()
        self.session.refresh(entidad)
        return entidad

    def delete(self, entidad: T) -> None:
        self.session.delete(entidad)
        self.session.flush()
