from pydantic import BaseModel, ConfigDict      # <-- import ConfigDict
from typing import Optional
from datetime import datetime                    # import the class, not just the module

from app.models.document import VerificationStatus, DocumentType


class DocumentResponse(BaseModel):
    id: int
    document_type: DocumentType
    file_path: str
    verification_status: VerificationStatus
    admin_notes: Optional[str] = None

    class Config:
        from_attributes = True


class DocumentVerificationRequest(BaseModel):
    verification_status: VerificationStatus
    admin_notes: Optional[str] = None


class UserBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone: Optional[str] = None


class DocumentAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_type: DocumentType
    file_path: str
    verification_status: VerificationStatus
    admin_notes: Optional[str] = None
    uploaded_at: datetime                        # now clearly the datetime class
    user: Optional[UserBrief] = None