from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy import Date
from sqlalchemy import DateTime
from sqlalchemy import Enum
from sqlalchemy import DECIMAL
from sqlalchemy import Text

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.database.base import Base

import enum


class BookingStatus(str, enum.Enum):
    pending_review = "pending_review"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"
    active = "active"
    completed = "completed"
    late_return = "late_return"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"


class Booking(Base):

    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id"),
        nullable=False
    )

    start_date = Column(
        Date,
        nullable=False
    )

    end_date = Column(
        Date,
        nullable=False
    )

    total_price = Column(
        DECIMAL(10, 2),
        nullable=False
    )

    booking_status = Column(
        Enum(BookingStatus),
        default=BookingStatus.pending_review,
        nullable=False
    )

    payment_status = Column(
        Enum(PaymentStatus),
        default=PaymentStatus.pending,
        nullable=False
    )

    admin_notes = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    user = relationship("User")

    vehicle = relationship("Vehicle")