from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import require_admin
from app.dependencies.auth import get_current_user

from app.services.dashboard_service import dashboard_service

from app.core.responses import ApiResponse

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/admin")
async def admin_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    data = dashboard_service.get_admin_dashboard(
        db
    )

    return ApiResponse.success(
        data=data,
        message="Dashboard fetched successfully"
    )
    
@router.get("/customer")
async def customer_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    data = dashboard_service.get_customer_dashboard(
        db,
        current_user.id
    )

    return ApiResponse.success(
        data=data,
        message="Dashboard fetched successfully"
    )