from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión en __enter__; hace commit, rollback y close en __exit__."""

    session: Session

    def __enter__(self) -> Self:
        self.session = session_factory()
        self._crear_repositorios()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        except Exception:
            self.session.rollback()
            raise
        finally:
            self.session.close()

    def _crear_repositorios(self) -> None:
        """Cada módulo crea aquí sus repositorios sobre self.session."""
