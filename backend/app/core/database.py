from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = (
    {"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {}
)

engine = create_engine(settings.database_url, connect_args=connect_args)


def create_all_tables() -> None:
    # Registra los modelos en SQLModel.metadata antes de crear las tablas.
    from app.modules.categorias import models as categorias_models  # noqa: F401
    from app.modules.pedidos import models as pedidos_models  # noqa: F401
    from app.modules.productos import models as productos_models  # noqa: F401
    from app.modules.usuarios import models as usuarios_models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)
