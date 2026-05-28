from sqlalchemy.orm import Session

from app.repositories.vehicle_repository import vehicle_repository

from app.schemas.vehicle import VehicleCreateRequest
from app.schemas.vehicle import VehicleUpdateRequest

from app.core.exceptions import NotFoundException


class VehicleService:

    def get_all_vehicles(self, db: Session):

        return vehicle_repository.get_all(db)

    def get_vehicle_by_id(
        self,
        db: Session,
        vehicle_id: int
    ):

        vehicle = vehicle_repository.get_by_id(
            db,
            vehicle_id
        )

        if not vehicle:
            raise NotFoundException("Vehicle not found")

        return vehicle

    def create_vehicle(
        self,
        db: Session,
        payload: VehicleCreateRequest
    ):

        return vehicle_repository.create(
            db,
            payload.model_dump()
        )

    def update_vehicle(
        self,
        db: Session,
        vehicle_id: int,
        payload: VehicleUpdateRequest
    ):

        vehicle = self.get_vehicle_by_id(
            db,
            vehicle_id
        )

        update_data = payload.model_dump(
            exclude_unset=True
        )

        return vehicle_repository.update(
            db,
            vehicle,
            update_data
        )

    def delete_vehicle(
        self,
        db: Session,
        vehicle_id: int
    ):

        vehicle = self.get_vehicle_by_id(
            db,
            vehicle_id
        )

        vehicle_repository.delete(db, vehicle)


vehicle_service = VehicleService()