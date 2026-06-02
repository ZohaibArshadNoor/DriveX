from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models.booking import Booking, BookingStatus


class BookingRepository:

    def create(self, db: Session, booking_data: dict):
        booking = Booking(**booking_data)
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    def get_by_id(self, db: Session, booking_id: int):
        return (
            db.query(Booking)
            .options(joinedload(Booking.vehicle))
            .filter(Booking.id == booking_id)
            .first()
        )

    def get_user_bookings(self, db: Session, user_id: int):
        return (
            db.query(Booking)
            .options(joinedload(Booking.vehicle))
            .filter(Booking.user_id == user_id)
            .order_by(Booking.created_at.desc())
            .all()
        )

    def get_all(self, db: Session):
        return (
            db.query(Booking)
            .options(joinedload(Booking.vehicle))
            .order_by(Booking.created_at.desc())
            .all()
        )

    def check_conflict(self, db: Session, vehicle_id: int, start_date, end_date):
        conflicting_booking = (
            db.query(Booking)
            .filter(
                and_(
                    Booking.vehicle_id == vehicle_id,
                    Booking.booking_status.notin_([
                        BookingStatus.REJECTED,
                        BookingStatus.CANCELLED
                    ]),
                    Booking.start_date <= end_date,
                    Booking.end_date >= start_date
                )
            )
            .first()
        )
        return conflicting_booking is not None

    def update(self, db: Session, booking: Booking, update_data: dict):
        for key, value in update_data.items():
            setattr(booking, key, value)
        db.commit()
        db.refresh(booking)
        return booking


booking_repository = BookingRepository()