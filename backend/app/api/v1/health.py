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