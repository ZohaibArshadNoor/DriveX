from sqlalchemy.orm import Session, joinedload

from app.models.document import Document
from app.repositories.base_repository import BaseRepository


class DocumentRepository(
    BaseRepository[Document]
):

    def __init__(self):
        super().__init__(Document)

    def get_user_documents(
        self,
        db: Session,
        user_id: int
    ):
        return (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .all()
        )

    def get_pending_documents(
        self,
        db: Session
    ):
        return (
            db.query(Document)
            .filter(
                Document.verification_status == "pending"
            )
            .all()
        )
    
    def get_all_with_users(self, db: Session):
        return (
            db.query(Document)
            .options(joinedload(Document.user))
            .order_by(Document.uploaded_at.desc())
            .all()
        )


document_repository = DocumentRepository()