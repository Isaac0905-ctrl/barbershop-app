from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date, time, timedelta, timezone
from uuid import UUID
from app.database import get_db
from app.models.barber import Barber
from app.models.barber_schedule import BarberSchedule
from app.models.barber_time_off import BarberTimeOff
from app.models.appointment import Appointment
from app.schemas.barber import BarberResponse
from app.schemas.availability import AvailabilityResponse

router = APIRouter(prefix="/barbers", tags=["Barbers"])

SLOT_MINUTES = 30

@router.get("/", response_model=list[BarberResponse])
def get_barbers(db: Session = Depends(get_db)):
    barbers = db.query(Barber).filter(Barber.is_active == True).all()
    return barbers

@router.get("/{barber_id}/availability", response_model=AvailabilityResponse)
def get_availability(
    barber_id: UUID,
    date: date,
    db: Session = Depends(get_db)
):
    barber = db.query(Barber).filter(
        Barber.id == barber_id,
        Barber.is_active == True
    ).first()
    if not barber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barbero no encontrado"
        )

    # 1 - Que dia de la semana es (0=lunes ... 6=domingo)
    weekday = date.weekday()

    # 2 - El barbero trabaja ese dia?
    schedule = db.query(BarberSchedule).filter(
        BarberSchedule.barber_id == barber_id,
        BarberSchedule.weekday == weekday,
        BarberSchedule.is_working_day == True
    ).first()
    if not schedule:
        return AvailabilityResponse(barber_id=str(barber_id), date=str(date), slots=[])

    # 3 - Esta de vacaciones?
    time_off = db.query(BarberTimeOff).filter(
        BarberTimeOff.barber_id == barber_id,
        BarberTimeOff.start_date <= date,
        BarberTimeOff.end_date >= date
    ).first()
    if time_off:
        return AvailabilityResponse(barber_id=str(barber_id), date=str(date), slots=[])

    # 4 - Generar todas las franjas posibles
    all_slots = []
    current = datetime.combine(date, schedule.start_time)
    end = datetime.combine(date, schedule.end_time)
    while current < end:
        all_slots.append(current)
        current += timedelta(minutes=SLOT_MINUTES)

    # 5 - Quitar franjas ocupadas
    appointments = db.query(Appointment).filter(
        Appointment.barber_id == barber_id,
        Appointment.status.in_(["pending", "confirmed"])
    ).all()
    occupied = set()
    for apt in appointments:
        apt_local = apt.scheduled_at.astimezone()
        if apt_local.date() == date:
            occupied.add(apt_local.strftime("%H:%M"))

    # 6 - Quitar franjas pasadas si es hoy
    now = datetime.now().astimezone()

    available = []
    for slot in all_slots:
        slot_str = slot.strftime("%H:%M")
        if slot_str in occupied:
            continue
        slot_aware = slot.astimezone()
        if date == now.date() and slot_aware <= now:
            continue
        available.append(slot_str)

    return AvailabilityResponse(barber_id=str(barber_id), date=str(date), slots=available)
