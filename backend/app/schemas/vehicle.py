from pydantic import BaseModel
from pydantic import ConfigDict

from decimal import Decimal
from typing import Optional

from app.models.vehicle import VehicleCategory
from app.models.vehicle import TransmissionType
from app.models.vehicle import FuelType
from app.models.vehicle import VehicleStatus


class VehicleCreateRequest(BaseModel):

    brand: str

    model: str

    year: int

    category: VehicleCategory

    transmission: TransmissionType

    fuel_type: FuelType

    seats: int

    price_per_day: Decimal

    thumbnail: Optional[str] = None

    description: Optional[str] = None


class VehicleUpdateRequest(BaseModel):

    brand: Optional[str] = None

    model: Optional[str] = None

    year: Optional[int] = None

    category: Optional[VehicleCategory] = None

    transmission: Optional[TransmissionType] = None

    fuel_type: Optional[FuelType] = None

    seats: Optional[int] = None

    price_per_day: Optional[Decimal] = None

    status: Optional[VehicleStatus] = None

    thumbnail: Optional[str] = None

    description: Optional[str] = None


class VehicleResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int

    brand: str

    model: str

    year: int

    category: VehicleCategory

    transmission: TransmissionType

    fuel_type: FuelType

    seats: int

    price_per_day: Decimal

    status: VehicleStatus

    thumbnail: Optional[str]

    description: Optional[str]