from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user

from app.services.booking_service import booking_service

from app.core.responses import ApiResponse

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/{booking_id}/pay-advance")
async def pay_advance(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    booking = booking_service.pay_advance(
        db,
        booking_id,
        current_user.id
    )

    return ApiResponse.success(
        data=booking,
        message="Advance payment completed successfully"
    )