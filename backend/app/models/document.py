from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy import Enum

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base

import enum


class DocumentType(str, enum.Enum):
    drivers_license = "drivers_license"
    national_id = "national_id"


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    document_type = Column(
        Enum(DocumentType),
        nullable=False
    )

    file_path = Column(
        String,
        nullable=False
    )

    verification_status = Column(
        Enum(VerificationStatus),
        default=VerificationStatus.pending,
        nullable=False
    )

    admin_notes = Column(String, nullable=True)

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship("User", back_populates="documents")