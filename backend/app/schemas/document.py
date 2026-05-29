# Document schemas placeholder\n
from pydantic import BaseModel
from typing import Optional

from app.models.document import VerificationStatus
from app.models.document import DocumentType


class DocumentResponse(BaseModel):
    id: int
    document_type: DocumentType
    file_path: str
    verification_status: VerificationStatus
    admin_notes: Optional[str]

    class Config:
        from_attributes = True


class DocumentVerificationRequest(BaseModel):
    verification_status: VerificationStatus
    admin_notes: Optional[str] = None