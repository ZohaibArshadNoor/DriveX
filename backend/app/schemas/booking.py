from pydantic import BaseModel, ConfigDict, field_validator
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from app.models.booking import BookingStatus, PaymentStatus
from app.schemas.vehicle import VehicleResponse

class BookingCreateRequest(BaseModel):
    vehicle_id: int
    start_date: date
    end_date: date

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, value, info):
        start_date = info.data.get("start_date")
        if start_date and value <= start_date:
            raise ValueError("End date must be after start date")
        return value

class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    vehicle_id: int
    start_date: date
    end_date: date
    total_price: Decimal
    booking_status: BookingStatus
    payment_status: PaymentStatus
    admin_notes: Optional[str] = None
    advance_amount: Optional[float] = None
    advance_paid: Optional[bool] = None
    payment_deadline: Optional[datetime] = None
    vehicle: Optional[VehicleResponse] = None

class BookingStatusUpdateRequest(BaseModel):
    admin_notes: Optional[str] = None