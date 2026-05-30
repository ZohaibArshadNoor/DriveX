from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.booking import BookingStatus


class ReportService:

    def booking_report(self, db: Session):

        return {

            "total": db.query(Booking).count(),

            "pending": db.query(Booking)
                .filter(Booking.booking_status == BookingStatus.PENDING)
                .count(),

            "approved": db.query(Booking)
                .filter(Booking.booking_status == BookingStatus.APPROVED_WAITING_ADVANCE)
                .count(),

            "active": db.query(Booking)
                .filter(Booking.booking_status == BookingStatus.ACTIVE)
                .count(),

            "completed": db.query(Booking)
                .filter(Booking.booking_status == BookingStatus.COMPLETED)
                .count(),

            "cancelled": db.query(Booking)
                .filter(Booking.booking_status == BookingStatus.CANCELLED)
                .count()
        }


report_service = ReportService()