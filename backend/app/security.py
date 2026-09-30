import base64
import hashlib
from datetime import datetime, timedelta, timezone

from cryptography.fernet import Fernet, InvalidToken
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    return jwt.encode({"sub": str(user_id), "exp": expires}, settings.secret_key, algorithm="HS256")


def decode_access_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None


def _fernet() -> Fernet | None:
    if not settings.token_encryption_key:
        return None
    # Accept a regular Render-generated secret and deterministically turn it into
    # the URL-safe 32-byte key required by Fernet.
    key = base64.urlsafe_b64encode(hashlib.sha256(settings.token_encryption_key.encode()).digest())
    return Fernet(key)


def encrypt_secret(value: str) -> str:
    cipher = _fernet()
    return cipher.encrypt(value.encode()).decode() if cipher else value


def decrypt_secret(value: str) -> str:
    cipher = _fernet()
    if not cipher:
        return value
    try:
        return cipher.decrypt(value.encode()).decode()
    except InvalidToken as exc:
        raise ValueError("Unable to decrypt stored Strava token") from exc

