from datetime import datetime

from app.modules.pedidos.models import DetallePedido, Pedido, ahora_utc
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Producto no disponible: {nombre}")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Stock insuficiente para: {nombre}")


class TransicionInvalida(Exception):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"Transición inválida: de {actual} a {nuevo}")


class PedidoNoCancelable(Exception):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, datos: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido()

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=PENDIENTE,
                    forma_pago=datos.forma_pago,
                    direccion_entrega=datos.direccion_entrega,
                    notas=datos.notas,
                    total=0,
                )
            )

            # El orden fijo evita bloqueos cruzados entre pedidos simultáneos.
            total = 0.0
            for item in sorted(datos.items, key=lambda i: i.producto_id):
                producto = uow.productos.get_by_id_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado()
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre)

                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            return PedidoRead.model_validate(uow.pedidos.add(pedido))

    def listar(
        self, usuario: UserPublic, estado: str | None, skip: int, limit: int
    ) -> PedidosPaginados:
        with self.uow as uow:
            usuario_id = None if usuario.role == "admin" else usuario.id
            total, items = uow.pedidos.list_by_usuario(
                usuario_id, estado, skip, limit
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(item) for item in items],
            )

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: str) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener_bloqueado(uow, pedido_id)
            if nuevo not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(pedido.estado, nuevo)
            if nuevo == CANCELADO:
                self._restituir_stock(uow, pedido)
            return self._aplicar_estado(uow, pedido, nuevo)

    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener_bloqueado(uow, pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != PENDIENTE:
                raise PedidoNoCancelable()
            self._restituir_stock(uow, pedido)
            return self._aplicar_estado(uow, pedido, CANCELADO)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_hoy = datetime.now().astimezone().replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            return ResumenPedidos(
                pendientes=conteos.get(PENDIENTE, 0),
                en_preparacion=conteos.get(EN_PREPARACION, 0),
                entregados=conteos.get(ENTREGADO, 0),
                cancelados=conteos.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(
                    uow.pedidos.sum_total_by_estado(ENTREGADO), 2
                ),
            )

    @staticmethod
    def _obtener_bloqueado(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id_for_update(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado()
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # Mismo orden que al crear, para evitar bloqueos cruzados.
        for item in sorted(pedido.items, key=lambda i: i.producto_id):
            producto = uow.productos.get_by_id_for_update(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad

    @staticmethod
    def _aplicar_estado(
        uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str
    ) -> PedidoRead:
        pedido.estado = nuevo
        pedido.updated_at = ahora_utc()
        return PedidoRead.model_validate(uow.pedidos.add(pedido))
