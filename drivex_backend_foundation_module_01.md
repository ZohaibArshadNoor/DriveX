# DriveX Backend Module 01
## Foundation Setup (FastAPI + Database + Config)

This is the first implementation module for the DriveX platform.

Goal of this module:
1. Create the backend project structure
2. Configure FastAPI
3. Configure environment variables
4. Configure SQLAlchemy database connection
5. Create the base ORM setup
6. Prepare dependency injection
7. Prepare middleware registration
8. Prepare API router aggregation

This module does NOT include:
- Authentication logic
- JWT
- User registration
- Vehicle CRUD
- Booking system

Those come later.

---

# 1. Folder Structure

```txt
backend/
├── main.py
├── requirements.txt
├── .env
├── .env.example
├── alembic.ini
│
├── app/
│   ├── __init__.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py
│   │       └── health.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── exceptions.py
│   │   └── responses.py
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   ├── session.py
│   │   └── base.py
│   │
│   ├── dependencies/
│   │   ├── __init__.py
│   │   └── db.py
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── cors.py
│   │
│   └── models/
│       └── __init__.py
```

---

# 2. Install Dependencies

## requirements.txt

```txt
fastapi
uvicorn[standard]
sqlalchemy
pydantic
pydantic-settings
python-dotenv
alembic
psycopg2-binary
python-multipart
email-validator
```

Install:

```bash
pip install -r requirements.txt
```

---

# 3. Environment Variables

## .env

```env
DATABASE_URL=sqlite:///./rental.db

SECRET_KEY=CHANGE_THIS_SECRET_KEY

ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

FRONTEND_URL=http://localhost:5173
```

---

## .env.example

```env
DATABASE_URL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=
REFRESH_TOKEN_EXPIRE_DAYS=
FRONTEND_URL=
```

---

# 4. Configuration Layer

## app/core/config.py

Purpose:
- Centralized configuration
- Prevent hardcoded values
- Typed environment variables

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./rental.db"

    SECRET_KEY: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
```

---

# 5. Database Connection

## app/database/base.py

```python
from sqlalchemy.orm import declarative_base


Base = declarative_base()
```

---

## app/database/session.py

Purpose:
- Create SQLAlchemy engine
- Create SessionLocal
- Enable SQLite thread support

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {}
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
```

---

# 6. Database Dependency Injection

## app/dependencies/db.py

Purpose:
- Provide one DB session per request
- Automatically close session

```python
from app.database.session import SessionLocal


async def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()
```

---

# 7. Standard API Response Builder

## app/core/responses.py

Purpose:
- Keep API responses consistent
- Prevent random response structures

```python
from fastapi.responses import JSONResponse


class ApiResponse:

    @staticmethod
    def success(data=None, message="Success", status_code=200):
        return JSONResponse(
            status_code=status_code,
            content={
                "success": True,
                "message": message,
                "data": data,
                "errors": None
            }
        )

    @staticmethod
    def error(message="Error", errors=None, status_code=400):
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "message": message,
                "data": None,
                "errors": errors
            }
        )
```

---

# 8. Custom Exceptions

## app/core/exceptions.py

Purpose:
- Centralized exception system
- Cleaner route handlers

```python
class NotFoundException(Exception):
    pass


class UnauthorizedException(Exception):
    pass


class ConflictException(Exception):
    pass


class ValidationException(Exception):
    pass
```

---

# 9. CORS Middleware

## app/middleware/cors.py

```python
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
```

---

# 10. API Health Route

## app/api/v1/health.py

Purpose:
- Verify API is running
- Verify routing system works

```python
from fastapi import APIRouter

from app.core.responses import ApiResponse


router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    return ApiResponse.success(
        data={
            "status": "online"
        },
        message="DriveX API is running"
    )
```

---

# 11. API Router Aggregator

## app/api/v1/router.py

Purpose:
- Central route registration
- Prevent messy main.py

```python
from fastapi import APIRouter

from app.api.v1.health import router as health_router


api_router = APIRouter()

api_router.include_router(health_router)
```

---

# 12. Main Application Entry

## main.py

Purpose:
- Compose the application
- Register middleware
- Register routes
- Create DB tables later

```python
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.exceptions import (
    ConflictException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
)
from app.middleware.cors import setup_cors


app = FastAPI(
    title="DriveX API",
    version="1.0.0"
)


setup_cors(app)


app.include_router(api_router, prefix="/api/v1")


@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "message": str(exc)
        }
    )


@app.exception_handler(UnauthorizedException)
async def unauthorized_exception_handler(request, exc):
    return JSONResponse(
        status_code=401,
        content={
            "success": False,
            "message": str(exc)
        }
    )


@app.exception_handler(ConflictException)
async def conflict_exception_handler(request, exc):
    return JSONResponse(
        status_code=409,
        content={
            "success": False,
            "message": str(exc)
        }
    )


@app.exception_handler(ValidationException)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": str(exc)
        }
    )


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "errors": exc.errors()
        }
    )
```

---

# 13. Run The Server

```bash
uvicorn main:app --reload
```

Expected:

```txt
http://127.0.0.1:8000/docs
```

Health endpoint:

```txt
GET /api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "DriveX API is running",
  "data": {
    "status": "online"
  },
  "errors": null
}
```

---

# 14. What You Should NOT Do Yet

Do NOT:
- Write JWT logic yet
- Write repositories yet
- Create user model yet
- Create Alembic migrations yet
- Create authentication routes yet
- Create upload logic yet

If you skip ahead now, you will create circular dependency problems and architecture inconsistency.

---

# 15. Next Module

Next module should be:

## Module 02
Authentication Foundation

Includes:
- User ORM model
- Password hashing
- JWT handler
- Auth schemas
- Register endpoint
- Login endpoint
- Token generation
- Current user dependency
- Auth repository
- Auth service

Do NOT start vehicles or bookings before authentication is stable.

---

# Module 02
# Authentication Foundation

Goal of this module:
1. Create User ORM model
2. Create authentication schemas
3. Implement password hashing
4. Implement JWT access tokens
5. Create user repository
6. Create auth service
7. Create register endpoint
8. Create login endpoint
9. Create current user dependency
10. Prepare protected route architecture

This module still does NOT include:
- Refresh tokens
- Email verification
- OAuth
- 2FA
- Password reset
- RBAC middleware

Those come later.

---

# 1. Updated Folder Structure

```txt
app/
├── api/
│   └── v1/
│       ├── auth.py
│       ├── health.py
│       └── router.py
│
├── auth/
│   ├── __init__.py
│   ├── jwt_handler.py
│   └── password.py
│
├── dependencies/
│   ├── auth.py
│   └── db.py
│
├── models/
│   ├── __init__.py
│   └── user.py
│
├── repositories/
│   ├── __init__.py
│   ├── base_repository.py
│   └── user_repository.py
│
├── schemas/
│   ├── __init__.py
│   ├── auth.py
│   └── user.py
│
└── services/
    ├── __init__.py
    └── auth_service.py
```

---

# 2. Install New Dependencies

Update requirements.txt:

```txt
python-jose[cryptography]
passlib[bcrypt]
```

Install:

```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

---

# 3. User ORM Model

## app/models/user.py

```python
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, nullable=False, index=True)

    password_hash = Column(String(255), nullable=False)

    role = Column(String(20), default="customer")

    is_verified = Column(Boolean, default=False)

    is_suspended = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
```

---

# 4. Register Models

## app/models/__init__.py

```python
from app.models.user import User
```

This import is REQUIRED.

Without this, SQLAlchemy will not detect the model during table creation.

---

# 5. Update main.py

Add table creation.

```python
from app.database.base import Base
from app.database.session import engine

import app.models

Base.metadata.create_all(bind=engine)
```

Put it after FastAPI app creation.

---

# 6. Password Hashing

## app/auth/password.py

```python
from passlib.context import CryptContext


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


class PasswordManager:

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        return pwd_context.verify(password, hashed_password)
```

---

# 7. JWT Handler

## app/auth/jwt_handler.py

```python
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
```

---

# 8. Authentication Schemas

## app/schemas/auth.py

```python
from pydantic import BaseModel
from pydantic import EmailStr
from pydantic import field_validator


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    @field_validator("password")
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")

        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

---

# 9. User Response Schema

## app/schemas/user.py

```python
from datetime import datetime

from pydantic import BaseModel
from pydantic import EmailStr


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
```

---

# 10. Base Repository

## app/repositories/base_repository.py

```python
    from typing import Generic
    from typing import Optional
    from typing import Type
    from typing import TypeVar

    from sqlalchemy.orm import Session


    T = TypeVar("T")


    class BaseRepository(Generic[T]):

        def __init__(self, model: Type[T]):
            self.model = model

        def get_by_id(self, db: Session, entity_id: int) -> Optional[T]:
            return (
                db.query(self.model)
                .filter(self.model.id == entity_id)
                .first()
            )

        def create(self, db: Session, entity_data: dict):
            entity = self.model(**entity_data)

            db.add(entity)
            db.commit()
            db.refresh(entity)

            return entity
```

---

# 11. User Repository

## app/repositories/user_repository.py

```python
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):

    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str):
        return (
            db.query(User)
            .filter(User.email == email)
            .first()
        )


user_repository = UserRepository()
```

---

# 12. Auth Service

## app/services/auth_service.py

```python
from sqlalchemy.orm import Session

from app.auth.jwt_handler import JWTHandler
from app.auth.password import PasswordManager
from app.core.exceptions import ConflictException
from app.core.exceptions import UnauthorizedException
from app.repositories.user_repository import user_repository


class AuthService:

    @staticmethod
    def register(db: Session, full_name: str, email: str, password: str):

        existing_user = user_repository.get_by_email(db, email)

        if existing_user:
            raise ConflictException("Email already exists")

        hashed_password = PasswordManager.hash_password(password)

        user = user_repository.create(
            db,
            {
                "full_name": full_name,
                "email": email,
                "password_hash": hashed_password
            }
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
```

---

# 13. Current User Dependency

## app/dependencies/auth.py

```python
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.jwt_handler import JWTHandler
from app.core.exceptions import UnauthorizedException
from app.dependencies.db import get_db
from app.repositories.user_repository import user_repository


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

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
```

---

# 14. Auth Routes

## app/api/v1/auth.py

```python
    from fastapi import APIRouter
    from fastapi import Depends
    from sqlalchemy.orm import Session

    from app.core.responses import ApiResponse
    from app.dependencies.auth import get_current_user
    from app.dependencies.db import get_db
    from app.schemas.auth import LoginRequest
    from app.schemas.auth import RegisterRequest
    from app.services.auth_service import auth_service


    router = APIRouter(
        prefix="/auth",
        tags=["Authentication"]
    )


    @router.post("/register")
    async def register(
        payload: RegisterRequest,
        db: Session = Depends(get_db)
    ):

        result = auth_service.register(
            db,
            payload.full_name,
            payload.email,
            payload.password
        )

        return ApiResponse.success(
            data=result,
            message="Registration successful"
        )


    @router.post("/login")
    async def login(
        payload: LoginRequest,
        db: Session = Depends(get_db)
    ):

        result = auth_service.login(
            db,
            payload.email,
            payload.password
        )

        return ApiResponse.success(
            data=result,
            message="Login successful"
        )


    @router.get("/me")
    async def get_profile(current_user=Depends(get_current_user)):

        return ApiResponse.success(
            data={
                "id": current_user.id,
                "full_name": current_user.full_name,
                "email": current_user.email,
                "role": current_user.role
            },
            message="Profile fetched successfully"
        )
```

---

# 15. Register Auth Router

## app/api/v1/router.py

Update:

```python
from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router


api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
```

---

# 16. Test Flow

## Register

```http
POST /api/v1/auth/register
```

Body:

```json
{
  "full_name": "Zohaib",
  "email": "zohaib@test.com",
  "password": "Password123"
}
```

---

## Login

```http
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "zohaib@test.com",
  "password": "Password123"
}
```

---

## Protected Route

```http
GET /api/v1/auth/me
Authorization: Bearer TOKEN_HERE
```

---

# 17. What You Should NOT Add Yet

Do NOT add:
- Refresh token logic
- Email verification
- Google OAuth
- 2FA
- Redis blacklist
- Middleware auth checks
- Role guards
- Password reset
- Vehicle tables
- Booking tables

You first need stable authentication.

Right now your objective is:
1. Register works
2. Login works
3. JWT works
4. Protected route works
5. DB persists users correctly

Only after that should you move forward.

---

# 18. Common Mistakes You Must Avoid

## Mistake 1
Using plain passwords in DB.

Wrong:

```python
password=password
```

Correct:

```python
password_hash=PasswordManager.hash_password(password)
```

---

## Mistake 2
Putting JWT logic inside route handlers.

Routes should stay thin.

JWT generation belongs in:

```txt
services/auth_service.py
```

---

## Mistake 3
Accessing DB directly in routes.

Wrong:

```python
db.query(User)
```

Routes should call services.

Services should call repositories.

---

## Mistake 4
Using synchronous global DB sessions.

Always use dependency injection:

```python
db: Session = Depends(get_db)
```

---

# 19. Next Module

Module 03 should include:

- Vehicle ORM models
- Vehicle schemas
- Vehicle repository
- Vehicle service
- Vehicle CRUD endpoints
- Vehicle filtering
- Vehicle image upload structure
- Public listing APIs
- Admin vehicle management

