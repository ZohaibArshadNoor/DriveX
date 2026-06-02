from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, ConfigDict
from pydantic import EmailStr


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
        
class UserAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_verified: bool
    is_suspended: bool
    admin_notes: Optional[str] = None
    created_at: datetime

# Request body for suspend/unsuspend
class SuspendRequest(BaseModel):
    admin_notes: Optional[str] = None

# Request body for verify/unverify
class VerifyRequest(BaseModel):
    is_verified: bool