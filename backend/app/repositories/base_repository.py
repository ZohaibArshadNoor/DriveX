from typing import Generic
from typing import Optional
from typing import Type
from typing import TypeVar

from sqlalchemy.orm import Session


T = TypeVar("T")


class BaseRepository(Generic[T]):

    def __init__(self, model: Type[T]):
        self.model = model

    def get_by_id(self, db: Session, entity_id: int) -> Optional[T]:
        return (
            db.query(self.model)
            .filter(self.model.id == entity_id)
            .first()
        )

    def create(self, db: Session, entity):

        db.add(entity)

        db.commit()

        db.refresh(entity)

        return entity