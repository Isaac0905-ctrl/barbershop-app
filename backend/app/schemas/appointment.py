from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AppointmentRequest(BaseModel):
    barber_id: UUID
    service_id: UUID
    scheduled_at: datetime
    notes: str | None = None

class AppointmentResponse(BaseModel):
    id: UUID
    barber_id: UUID
    service_id: UUID
    client_id: UUID
    scheduled_at: datetime
    status: str
    notes: str | None
    cancellation_reason: str | None
    cancelled_by: str | None
    created_at: datetime

    class Config:
        from_attributes = True
