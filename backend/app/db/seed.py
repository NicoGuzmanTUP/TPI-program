"""Carga inicial idempotente. Ejecución: python -m app.db.seed"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

CATEGORIAS = [
    ("Pizzas", "Pizzas al horno de barro"),
    ("Hamburguesas", "Hamburguesas caseras con papas"),
    ("Bebidas", "Bebidas frías"),
    ("Postres", "Postres de elaboración propia"),
]

# nombre, categoría, descripción, precio, stock
PRODUCTOS = [
    ("Pizza Muzzarella", "Pizzas", "Salsa de tomate, muzzarella y orégano", 8500.0, 25),
    ("Pizza Napolitana", "Pizzas", "Muzzarella, tomate fresco y ajo", 9500.0, 20),
    ("Pizza Fugazzeta", "Pizzas", "Cebolla, muzzarella y aceitunas", 9800.0, 15),
    ("Hamburguesa Clásica", "Hamburguesas", "Carne, lechuga y tomate", 7500.0, 30),
    ("Hamburguesa Doble Cheddar", "Hamburguesas", "Doble carne y cheddar", 9900.0, 20),
    ("Hamburguesa Veggie", "Hamburguesas", "Medallón de garbanzos", 8200.0, 12),
    ("Agua Mineral 500 ml", "Bebidas", "Con o sin gas", 1500.0, 60),
    ("Gaseosa Cola 500 ml", "Bebidas", "Línea cola", 2200.0, 50),
    ("Flan Casero", "Postres", "Con dulce de leche", 3500.0, 18),
    ("Brownie", "Postres", "Con nueces", 3800.0, 16),
]


def imagen_para(nombre: str) -> str:
    return f"https://placehold.co/600x400?text={nombre.replace(' ', '+')}"


def cargar_admin(session: Session) -> None:
    existente = session.exec(
        select(Usuario).where(Usuario.username == "admin")
    ).first()
    if existente is None:
        session.add(
            Usuario(
                username="admin",
                full_name="Administrador",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
            )
        )


def cargar_categorias(session: Session) -> dict[str, int]:
    ids: dict[str, int] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()
        assert categoria.id is not None
        ids[nombre] = categoria.id
    return ids


def cargar_productos(session: Session, categorias: dict[str, int]) -> None:
    for nombre, categoria, descripcion, precio, stock in PRODUCTOS:
        existente = session.exec(
            select(Producto).where(Producto.nombre == nombre)
        ).first()
        if existente is None:
            session.add(
                Producto(
                    nombre=nombre,
                    categoria_id=categorias[categoria],
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=imagen_para(nombre),
                    stock=stock,
                )
            )


def main() -> None:
    create_all_tables()
    with session_factory() as session:
        cargar_admin(session)
        cargar_productos(session, cargar_categorias(session))
        session.commit()
    print("Seed completado: admin, categorías y productos disponibles.")


if __name__ == "__main__":
    main()
