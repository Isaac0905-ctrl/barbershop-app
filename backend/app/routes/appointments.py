from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from uuid import UUID
from app.database import get_db
from app.models.appointment import Appointment
from app.models.barber import Barber
from app.models.service import Service
from app.schemas.appointment import AppointmentRequest, AppointmentResponse
from app.dependencies.auth import require_role

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    data: AppointmentRequest,
    db: Session = Depends(get_db),
    user = Depends(require_role("client"))
):
    barber = db.query(Barber).filter(
        Barber.id == data.barber_id,
        Barber.is_active == True
    ).first()
    if not barber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barbero no encontrado o no disponible"
        )

    service = db.query(Service).filter(
        Service.id == data.service_id,
        Service.is_active == True
    ).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado o no disponible"
        )

    if data.scheduled_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha y hora deben ser futuras"
        )

    conflict = db.query(Appointment).filter(
        Appointment.barber_id == data.barber_id,
        Appointment.status.in_(["pending", "confirmed"]),
        Appointment.scheduled_at == data.scheduled_at
    ).first()
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El barbero ya tiene una cita en ese horario"
        )

    appointment = Appointment(
        barber_id=data.barber_id,
        service_id=data.service_id,
        client_id=UUID(user["sub"]),
        scheduled_at=data.scheduled_at,
        notes=data.notes,
        status="pending"
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment
