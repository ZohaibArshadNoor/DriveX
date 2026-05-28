from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from app.auth.jwt_handler import JWTHandler
from app.core.exceptions import UnauthorizedException
from app.dependencies.db import get_db
from app.repositories.user_repository import user_repository



security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    payload = JWTHandler.decode_token(token)

    if not payload:
        raise UnauthorizedException("Invalid token")

    user_id = payload.get("sub")

    if not user_id:
        raise UnauthorizedException("Invalid token")

    user = user_repository.get_by_id(db, int(user_id))

    if not user:
        raise UnauthorizedException("User not found")

    return user

def require_admin(
    current_user = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise UnauthorizedException(
            "Admin access required"
        )

    return current_user

