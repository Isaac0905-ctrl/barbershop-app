from pydantic import BaseModel
from uuid import UUID

class BarberResponse(BaseModel):
    id: UUID
    name: str
    email: str
    bio: str | None
    photo_url: str | None
    is_active: bool

    class Config:
        from_attributes = True
