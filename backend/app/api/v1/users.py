from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.db import get_db
from app.dependencies.auth import require_admin
from app.repositories.user_repository import user_repository
from app.schemas.user import SuspendRequest, VerifyRequest, UserAdminResponse
from app.core.responses import ApiResponse
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])


@router.get("/")
def get_all_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    """Returns all registered users (all roles)."""
    users = user_repository.get_all(db)
    # ApiResponse.success serialises SQLAlchemy objects via jsonable_encoder,
    # so the response includes all User attributes (id, full_name, etc.)
    return ApiResponse.success(data=users, message="Users fetched")


@router.patch("/{user_id}/suspend")
def toggle_suspend(
    user_id: int,
    payload: SuspendRequest = Body({}),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    """Suspend or unsuspend a user. Optionally attach an admin note."""
    user = user_repository.get_by_id(db, user_id)
    if not user:
        raise NotFoundException("User not found")

    new_suspend = not user.is_suspended
    update_data = {"is_suspended": new_suspend}

    # Only update notes if provided (None → keep existing note)
    if payload.admin_notes is not None:
        update_data["admin_notes"] = payload.admin_notes

    updated = user_repository.update(db, user, update_data)
    action = "suspended" if new_suspend else "unsuspended"
    return ApiResponse.success(data=updated, message=f"User {action}")


@router.patch("/{user_id}/verify")
def set_verification(
    user_id: int,
    payload: VerifyRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    """Manually mark a user as verified / unverified."""
    user = user_repository.get_by_id(db, user_id)
    if not user:
        raise NotFoundException("User not found")

    updated = user_repository.update(db, user, {"is_verified": payload.is_verified})
    status = "verified" if payload.is_verified else "unverified"
    return ApiResponse.success(data=updated, message=f"User marked as {status}")