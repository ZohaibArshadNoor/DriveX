from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.auth import require_admin

from app.services.booking_service import booking_service

from app.schemas.booking import BookingCreateRequest

from app.core.responses import ApiResponse


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


@router.post("/")
async def create_booking(
    payload: BookingCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    booking = booking_service.create_booking(
        db,
        current_user.id,
        payload
    )

    return ApiResponse.success(
        data=booking,
        message="Booking created successfully"
    )


@router.get("/")
async def get_my_bookings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    bookings = booking_service.get_user_bookings(
        db,
        current_user.id
    )

    return ApiResponse.success(
        data=bookings,
        message="Bookings fetched successfully"
    )


@router.get("/{booking_id}")
async def get_booking_by_id(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    booking = booking_service.get_booking_by_id(
        db,
        booking_id
    )

    return ApiResponse.success(
        data=booking,
        message="Booking fetched successfully"
    )


@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    booking = booking_service.cancel_booking(
        db,
        booking_id,
        current_user.id
    )

    return ApiResponse.success(
        data=booking,
        message="Booking cancelled successfully"
    )


@router.patch("/{booking_id}/approve")
async def approve_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    booking = booking_service.approve_booking(
        db,
        booking_id
    )

    return ApiResponse.success(
        data=booking,
        message="Booking approved successfully"
    )