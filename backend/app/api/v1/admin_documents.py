from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import require_admin
from app.repositories.document_repository import document_repository
from app.core.responses import ApiResponse

router = APIRouter(prefix="/admin/documents", tags=["Admin Documents"])


@router.get("/")
def get_all_documents(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    docs = document_repository.get_all_with_users(db)
    return ApiResponse.success(data=docs, message="Documents fetched")