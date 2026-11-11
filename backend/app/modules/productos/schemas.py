from pydantic import ConfigDict, field_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=1)
    descripcion: str | None = None
    precio_base: float = Field(ge=0)
    imagen_url: str | None = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int


class ProductoUpdate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str | None = Field(default=None, min_length=1)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = None

    @field_validator("nombre", "precio_base", "stock", "disponible", "categoria_id")
    @classmethod
    def rechazar_nulo(cls, valor: object) -> object:
        if valor is None:
            raise ValueError("El campo no puede ser nulo")
        return valor


class ProductoStockUpdate(SQLModel):
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None

    @field_validator("stock", "disponible")
    @classmethod
    def rechazar_nulo(cls, valor: object) -> object:
        if valor is None:
            raise ValueError("El campo no puede ser nulo")
        return valor


class ProductoRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
