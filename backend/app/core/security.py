from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_access_token(subject: str) -> str:
    expira = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {"sub": subject, "exp": expira},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_access_token(token: str) -> str | None:
    """Devuelve el subject del token, o None si es inválido o venció."""
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
    except JWTError:
        return None
    subject = payload.get("sub")
    return subject if isinstance(subject, str) else None
