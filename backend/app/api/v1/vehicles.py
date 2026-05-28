from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import require_admin

from app.services.vehicle_service import vehicle_service

from app.schemas.vehicle import VehicleCreateRequest
from app.schemas.vehicle import VehicleUpdateRequest
from app.schemas.vehicle import VehicleResponse

from app.core.responses import ApiResponse

router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)


@router.get("/")
async def get_all_vehicles(
    db: Session = Depends(get_db)
):

    vehicles = vehicle_service.get_all_vehicles(db)

    return ApiResponse.success(
        data=vehicles,
        message="Vehicles fetched successfully"
    )


@router.get("/{vehicle_id}")
async def get_vehicle_by_id(
    vehicle_id: int,
    db: Session = Depends(get_db)
):

    vehicle = vehicle_service.get_vehicle_by_id(
        db,
        vehicle_id
    )

    return ApiResponse.success(
        data=vehicle,
        message="Vehicle fetched successfully"
    )


@router.post("/")
async def create_vehicle(
    payload: VehicleCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    vehicle = vehicle_service.create_vehicle(
        db,
        payload
    )

    return ApiResponse.success(
        data=vehicle,
        message="Vehicle created successfully"
    )


@router.put("/{vehicle_id}")
async def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    vehicle = vehicle_service.update_vehicle(
        db,
        vehicle_id,
        payload
    )

    return ApiResponse.success(
        data=vehicle,
        message="Vehicle updated successfully"
    )


@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    vehicle_service.delete_vehicle(
        db,
        vehicle_id
    )

    return ApiResponse.success(
        message="Vehicle deleted successfully"
    )
