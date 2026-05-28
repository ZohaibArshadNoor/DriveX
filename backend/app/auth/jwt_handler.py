from datetime import datetime
from datetime import timedelta
from datetime import timezone

from jose import jwt
from jose.exceptions import JWTError

from app.core.config import settings


ALGORITHM = "HS256"


class JWTHandler:

    @staticmethod
    def create_access_token(data: dict):
        payload = data.copy()

        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

        payload.update({"exp": expire})

        token = jwt.encode(
            payload,
            settings.SECRET_KEY,
            algorithm=ALGORITHM
        )

        return token

    @staticmethod
    def decode_token(token: str):
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[ALGORITHM]
            )

            return payload

        except JWTError:
            return None