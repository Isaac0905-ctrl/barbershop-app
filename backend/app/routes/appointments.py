from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from uuid import UUID
from app.database import get_db
from app.models.appointment import Appointment
from app.models.barber import Barber
from app.models.service import Service
from app.models.client import Client
from app.schemas.appointment import AppointmentRequest, AppointmentResponse, CancelRequest
from app.dependencies.auth import require_role
from app.utils.email import send_new_appointment_email, send_confirmation_email, send_cancellation_email

router = APIRouter(prefix="/appointments", tags=["Appointments"])

def format_datetime(dt):
    return dt.strftime("%A %d de %B de %Y a las %H:%M")

@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    data: AppointmentRequest,
    background_tasks: BackgroundTasks,
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

    client = db.query(Client).filter(Client.id == UUID(user["sub"])).first()

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

    background_tasks.add_task(
        send_new_appointment_email,
        barber.email,
        barber.name,
        client.full_name,
        service.name,
        format_datetime(appointment.scheduled_at)
    )

    return appointment

@router.get("/my", response_model=list[AppointmentResponse])
def get_my_appointments(
    db: Session = Depends(get_db),
    user = Depends(require_role("client"))
):
    appointments = db.query(Appointment).filter(
        Appointment.client_id == UUID(user["sub"])
    ).order_by(Appointment.scheduled_at.desc()).all()
    return appointments

@router.get("/barber", response_model=list[AppointmentResponse])
def get_barber_appointments(
    db: Session = Depends(get_db),
    user = Depends(require_role("barber"))
):
    appointments = db.query(Appointment).filter(
        Appointment.barber_id == UUID(user["sub"])
    ).order_by(Appointment.scheduled_at.asc()).all()
    return appointments

@router.patch("/{appointment_id}/confirm", response_model=AppointmentResponse)
async def confirm_appointment(
    appointment_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user = Depends(require_role("barber"))
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada"
        )
    if appointment.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede confirmar una cita en estado '{appointment.status}'"
        )

    barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
    service = db.query(Service).filter(Service.id == appointment.service_id).first()
    client = db.query(Client).filter(Client.id == appointment.client_id).first()

    appointment.status = "confirmed"
    db.commit()
    db.refresh(appointment)

    background_tasks.add_task(
        send_confirmation_email,
        client.email,
        client.full_name,
        service.name,
        barber.name,
        format_datetime(appointment.scheduled_at)
    )

    return appointment

@router.patch("/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    appointment_id: UUID,
    data: CancelRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user = Depends(require_role("barber", "client"))
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada"
        )
    if appointment.status in ["cancelled", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede cancelar una cita en estado '{appointment.status}'"
        )

    barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
    service = db.query(Service).filter(Service.id == appointment.service_id).first()
    client = db.query(Client).filter(Client.id == appointment.client_id).first()

    appointment.status = "cancelled"
    appointment.cancellation_reason = data.reason
    appointment.cancelled_by = user["role"]
    db.commit()
    db.refresh(appointment)

    if user["role"] == "barber":
        background_tasks.add_task(
            send_cancellation_email,
            client.email,
            client.full_name,
            service.name,
            barber.name,
            format_datetime(appointment.scheduled_at),
            data.reason
        )

    return appointment
