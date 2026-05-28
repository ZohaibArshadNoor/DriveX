from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle


class VehicleRepository:

    def get_all(self, db: Session):

        return db.query(Vehicle).all()

    def get_by_id(self, db: Session, vehicle_id: int):

        return (
            db.query(Vehicle)
            .filter(Vehicle.id == vehicle_id)
            .first()
        )

    def create(self, db: Session, vehicle_data: dict):

        vehicle = Vehicle(**vehicle_data)

        db.add(vehicle)

        db.commit()

        db.refresh(vehicle)

        return vehicle

    def update(
        self,
        db: Session,
        vehicle: Vehicle,
        update_data: dict
    ):

        for key, value in update_data.items():
            setattr(vehicle, key, value)

        db.commit()

        db.refresh(vehicle)

        return vehicle

    def delete(
        self,
        db: Session,
        vehicle: Vehicle
    ):

        db.delete(vehicle)

        db.commit()


vehicle_repository = VehicleRepository()