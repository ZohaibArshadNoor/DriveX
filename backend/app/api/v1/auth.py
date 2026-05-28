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