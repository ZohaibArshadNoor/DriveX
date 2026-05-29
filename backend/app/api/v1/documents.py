from fastapi import APIRouter
from fastapi import Depends
from fastapi import UploadFile
from fastapi import File
from fastapi import Form

from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.auth import require_admin

from app.services.document_service import document_service

from app.schemas.document import DocumentVerificationRequest

from app.models.document import DocumentType

from app.core.responses import ApiResponse


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/")
async def upload_document(
    document_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    document = await document_service.upload_document(
        db,
        current_user.id,
        document_type,
        file
    )

    return ApiResponse.success(
        data=document,
        message="Document uploaded successfully"
    )


@router.get("/my")
async def get_my_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    documents = document_service.get_my_documents(
        db,
        current_user.id
    )

    return ApiResponse.success(
        data=documents,
        message="Documents fetched successfully"
    )


@router.patch("/{document_id}/verify")
async def verify_document(
    document_id: int,
    payload: DocumentVerificationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    document = document_service.verify_document(
        db,
        document_id,
        payload.verification_status,
        payload.admin_notes
    )

    return ApiResponse.success(
        data=document,
        message="Document verified successfully"
    )