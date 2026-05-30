from sqlalchemy.orm import Session

from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.booking import Booking, BookingStatus
from app.models.document import Document

class DashboardService:

    def get_admin_dashboard(self, db: Session):

        return {

            "total_users": db.query(User).count(),

            "total_vehicles": db.query(Vehicle).count(),

            "total_bookings": db.query(Booking).count(),

            "pending_bookings": db.query(Booking)
                .filter(Booking.booking_status == BookingStatus.PENDING)
                .count(),

            "active_bookings": db.query(Booking)
                .filter(Booking.booking_status == BookingStatus.ACTIVE)
                .count(),

            "completed_bookings": db.query(Booking)
                .filter(Booking.booking_status == BookingStatus.COMPLETED)
                .count(),

            "pending_documents": db.query(Document)
                .filter(Document.verification_status == "pending")
                .count()
        }


    def get_customer_dashboard(
        self,
        db,
        user_id
    ):

        return {

            "total_bookings":
                db.query(Booking)
                .filter(Booking.user_id == user_id)
                .count(),

            "pending_bookings":
                db.query(Booking)
                .filter(
                    Booking.user_id == user_id,
                    Booking.booking_status == BookingStatus.PENDING
                )
                .count(),

            "active_bookings":
                db.query(Booking)
                .filter(
                    Booking.user_id == user_id,
                    Booking.booking_status == BookingStatus.ACTIVE
                )
                .count(),

            "completed_bookings":
                db.query(Booking)
                .filter(
                    Booking.user_id == user_id,
                    Booking.booking_status == BookingStatus.COMPLETED
                )
                .count(),

            "cancelled_bookings":
                db.query(Booking)
                .filter(
                    Booking.user_id == user_id,
                    Booking.booking_status == BookingStatus.CANCELLED
                )
                .count(),

            "documents_uploaded":
                db.query(Document)
                .filter(
                    Document.user_id == user_id
                )
                .count(),

            "documents_approved":
                db.query(Document)
                .filter(
                    Document.user_id == user_id,
                    Document.verification_status == "approved"
                )
                .count()
        }
        
        
dashboard_service = DashboardService()