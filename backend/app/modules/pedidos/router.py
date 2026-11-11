from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoCancelable,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

SesionDep = Annotated[UserPublic, Depends(get_current_active_user)]
AdminDep = Annotated[UserPublic, Depends(require_role(["admin"]))]


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]

NO_ENCONTRADO = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado"
)
AJENO = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="El pedido pertenece a otro usuario",
)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    datos: PedidoCreate, usuario: SesionDep, service: ServiceDep
) -> PedidoRead:
    try:
        return service.crear(datos, usuario.id)
    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    except ProductoRepetido:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hay productos repetidos en el pedido",
        )
    except (ProductoNoDisponible, StockInsuficiente) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)
        )


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: SesionDep,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(usuario, estado, skip, limit)


# Se declara antes de /{pedido_id} para que "resumen" no se tome como un id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_: AdminDep, service: ServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int, usuario: SesionDep, service: ServiceDep
) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado:
        raise NO_ENCONTRADO
    except PedidoAjeno:
        raise AJENO


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int,
    datos: CambioEstado,
    _: AdminDep,
    service: ServiceDep,
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except PedidoNoEncontrado:
        raise NO_ENCONTRADO
    except TransicionInvalida as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)
        )


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int, usuario: SesionDep, service: ServiceDep
) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario.id)
    except PedidoNoEncontrado:
        raise NO_ENCONTRADO
    except PedidoAjeno:
        raise AJENO
    except PedidoNoCancelable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se puede cancelar un pedido en PENDIENTE",
        )
