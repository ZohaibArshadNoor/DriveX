from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import require_admin

from app.services.report_service import report_service

from app.core.responses import ApiResponse


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get("/bookings")
async def booking_report(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    data = report_service.booking_report(
        db
    )

    return ApiResponse.success(
        data=data,
        message="Booking report fetched successfully"
    )