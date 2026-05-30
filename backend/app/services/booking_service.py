from datetime import timedelta, datetime

from sqlalchemy.orm import Session

from app.repositories.booking_repository import booking_repository
from app.repositories.vehicle_repository import vehicle_repository
from app.repositories.user_repository import user_repository

from app.schemas.booking import BookingCreateRequest

from app.models.booking import BookingStatus

from app.core.exceptions import (
    NotFoundException,
    ConflictException,
    BadRequestException
)


class BookingService:

    def create_booking(
        self,
        db: Session,
        user_id: int,
        payload: BookingCreateRequest
    ):

        vehicle = vehicle_repository.get_by_id(
            db,
            payload.vehicle_id
        )

        if not vehicle:
            raise NotFoundException(
                "Vehicle not found"
            )

        user = user_repository.get_by_id(
            db,
            user_id
        )

        approved_document = any(
            doc.verification_status.value == "approved"
            for doc in user.documents
        )

        if not approved_document:
            raise BadRequestException(
                "Approved document required before booking"
            )

        has_conflict = booking_repository.check_conflict(
            db,
            payload.vehicle_id,
            payload.start_date,
            payload.end_date
        )

        if has_conflict:
            raise ConflictException(
                "Vehicle already booked for selected dates"
            )

        total_days = (
            payload.end_date - payload.start_date
        ).days

        total_price = (
            total_days * vehicle.price_per_day
        )

        booking_data = {
            "user_id": user_id,
            "vehicle_id": payload.vehicle_id,
            "start_date": payload.start_date,
            "end_date": payload.end_date,
            "total_price": total_price,
            "booking_status": BookingStatus.PENDING,
            "advance_amount": float(total_price) * 0.3
        }

        return booking_repository.create(
            db,
            booking_data
        )

    def get_user_bookings(
        self,
        db: Session,
        user_id: int
    ):

        return booking_repository.get_user_bookings(
            db,
            user_id
        )

    def get_booking_by_id(
        self,
        db: Session,
        booking_id: int
    ):

        booking = booking_repository.get_by_id(
            db,
            booking_id
        )

        if not booking:
            raise NotFoundException(
                "Booking not found"
            )

        return booking

    def cancel_booking(
        self,
        db: Session,
        booking_id: int,
        user_id: int
    ):

        booking = self.get_booking_by_id(
            db,
            booking_id
        )

        if booking.user_id != user_id:
            raise ConflictException(
                "You cannot cancel this booking"
            )

        if booking.booking_status in [
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED
        ]:
            raise ConflictException(
                "Booking cannot be cancelled"
            )

        return booking_repository.update(
            db,
            booking,
            {
                "booking_status": BookingStatus.CANCELLED
            }
        )

    def approve_booking(
        self,
        db: Session,
        booking_id: int
    ):

        booking = self.get_booking_by_id(
            db,
            booking_id
        )

        return booking_repository.update(
            db,
            booking,
            {
                "booking_status": BookingStatus.APPROVED_WAITING_ADVANCE,
                "payment_deadline": datetime.utcnow() + timedelta(hours=24)
            }
        )

    def pay_advance(
        self,
        db: Session,
        booking_id: int,
        user_id: int
    ):

        booking = booking_repository.get_by_id(
            db,
            booking_id
        )

        if not booking:
            raise NotFoundException(
                "Booking not found"
            )

        if booking.user_id != user_id:
            raise ConflictException(
                "Not allowed"
            )

        if (
            booking.booking_status
            != BookingStatus.APPROVED_WAITING_ADVANCE
        ):
            raise BadRequestException(
                "Booking is not waiting for advance payment"
            )

        return booking_repository.update(
            db,
            booking,
            {
                "advance_paid": True,
                "advance_paid_at": datetime.utcnow(),
                "booking_status": BookingStatus.CONFIRMED
            }
        )


booking_service = BookingService()