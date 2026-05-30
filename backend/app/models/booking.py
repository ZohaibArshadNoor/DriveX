from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy import Date
from sqlalchemy import DateTime
from sqlalchemy import Enum
from sqlalchemy import DECIMAL
from sqlalchemy import Text
from sqlalchemy import Float
from sqlalchemy import Boolean

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.database.base import Base

import enum


class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED_WAITING_ADVANCE = "APPROVED_WAITING_ADVANCE"
    CONFIRMED = "CONFIRMED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


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
        default=BookingStatus.PENDING,
        nullable=False
    )

    payment_status = Column(
        Enum(PaymentStatus),
        default=PaymentStatus.pending,
        nullable=False
    )

    advance_amount = Column(
        Float,
        default=0
    )

    advance_paid = Column(
        Boolean,
        default=False
    )

    advance_paid_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    payment_deadline = Column(
        DateTime(timezone=True),
        nullable=True
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