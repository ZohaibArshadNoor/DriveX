from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DECIMAL
from sqlalchemy import DateTime
from sqlalchemy import Enum
from sqlalchemy.sql import func

from app.database.base import Base

import enum


class VehicleCategory(str, enum.Enum):
    sedan = "sedan"
    suv = "suv"
    hatchback = "hatchback"
    luxury = "luxury"
    van = "van"


class TransmissionType(str, enum.Enum):
    automatic = "automatic"
    manual = "manual"


class FuelType(str, enum.Enum):
    petrol = "petrol"
    diesel = "diesel"
    electric = "electric"
    hybrid = "hybrid"


class VehicleStatus(str, enum.Enum):
    available = "available"
    reserved = "reserved"
    rented = "rented"
    maintenance = "maintenance"


class Vehicle(Base):

    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)

    brand = Column(String(100), nullable=False)

    model = Column(String(100), nullable=False)

    year = Column(Integer, nullable=False)

    category = Column(Enum(VehicleCategory), nullable=False)

    transmission = Column(Enum(TransmissionType), nullable=False)

    fuel_type = Column(Enum(FuelType), nullable=False)

    seats = Column(Integer, nullable=False)

    price_per_day = Column(DECIMAL(10, 2), nullable=False)

    status = Column(
        Enum(VehicleStatus),
        default=VehicleStatus.available,
        nullable=False
    )

    thumbnail = Column(String(500), nullable=True)

    description = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )