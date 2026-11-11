from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                skip, limit, search, categoria_id, disponible
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(item) for item in items],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(
                self._obtener_activo(uow, producto_id)
            )

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, datos.categoria_id)
            producto = Producto.model_validate(datos.model_dump())
            return ProductoRead.model_validate(uow.productos.add(producto))

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            cambios = datos.model_dump(exclude_unset=True)
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            return ProductoRead.model_validate(uow.productos.add(producto))

    def actualizar_stock(
        self, producto_id: int, datos: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            producto.sqlmodel_update(datos.model_dump(exclude_unset=True))
            return ProductoRead.model_validate(uow.productos.add(producto))

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)

    @staticmethod
    def _obtener_activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado()
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada()
