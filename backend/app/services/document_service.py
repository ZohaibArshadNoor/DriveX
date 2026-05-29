from sqlalchemy.orm import Session

from fastapi import UploadFile

from app.models.document import Document
from app.models.document import DocumentType
from app.models.document import VerificationStatus

from app.repositories.document_repository import document_repository

from app.utils.file_handler import file_handler

from app.core.exceptions import NotFoundException


class DocumentService:

    async def upload_document(
        self,
        db: Session,
        user_id: int,
        document_type: DocumentType,
        file: UploadFile
    ):

        file_path = await file_handler.save_file(
            file,
            "uploads/documents"
        )

        document = Document(
            user_id=user_id,
            document_type=document_type,
            file_path=file_path
        )

        return document_repository.create(
            db,
            document
        )

    def get_my_documents(
        self,
        db: Session,
        user_id: int
    ):
        return document_repository.get_user_documents(
            db,
            user_id
        )

    def verify_document(
        self,
        db: Session,
        document_id: int,
        verification_status: VerificationStatus,
        admin_notes: str = None
    ):

        document = document_repository.get_by_id(
            db,
            document_id
        )

        if not document:
            raise NotFoundException(
                "Document not found"
            )

        document.verification_status = verification_status
        document.admin_notes = admin_notes
        
        document.user.is_verified = True

        db.commit()
        db.refresh(document)

        return document


document_service = DocumentService()