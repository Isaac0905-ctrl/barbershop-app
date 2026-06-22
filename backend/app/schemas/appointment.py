from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import datetime

class AppointmentRequest(BaseModel):
    barber_id: UUID
    service_id: UUID
    scheduled_at: datetime
    notes: str | None = None

class CancelRequest(BaseModel):
    reason: str

    @field_validator("reason")
    @classmethod
    def reason_not_empty(cls, v):
        if not v.strip():
            raise ValueError("El motivo de cancelación no puede estar vacío")
        return v.strip()

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
