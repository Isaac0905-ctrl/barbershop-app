from pydantic import BaseModel
from uuid import UUID

class ServiceResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    price: float
    duration_min: int
    is_active: bool

    class Config:
        from_attributes = True
