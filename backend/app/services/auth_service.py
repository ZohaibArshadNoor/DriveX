from sqlalchemy.orm import Session

from app.auth.jwt_handler import JWTHandler
from app.auth.password import PasswordManager
from app.core.exceptions import ConflictException
from app.core.exceptions import UnauthorizedException
from app.repositories.user_repository import user_repository

from app.models.user import User


class AuthService:

    @staticmethod
    def register(db: Session, full_name: str, email: str, password: str):

        existing_user = user_repository.get_by_email(db, email)

        if existing_user:
            raise ConflictException("Email already exists")

        hashed_password = PasswordManager.hash_password(password)

        user = User(
            full_name=full_name,    
            email=email,
            password_hash=hashed_password,
            role="customer"
            )
        
        user = user_repository.create(
            db,
            user
            )

        token = JWTHandler.create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role
            }
        )

        return {
            "access_token": token,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            }
        }

    @staticmethod
    def login(db: Session, email: str, password: str):

        user = user_repository.get_by_email(db, email)

        if not user:
            raise UnauthorizedException("Invalid credentials")

        is_valid = PasswordManager.verify_password(
            password,
            user.password_hash
        )

        if not is_valid:
            raise UnauthorizedException("Invalid credentials")

        token = JWTHandler.create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role
            }
        )

        return {
            "access_token": token,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            }
        }


auth_service = AuthService()