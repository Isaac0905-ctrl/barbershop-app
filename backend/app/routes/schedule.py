from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models.barber_schedule import BarberSchedule
from app.models.barber_time_off import BarberTimeOff
from app.schemas.schedule import (
    ScheduleItem, ScheduleResponse,
    TimeOffRequest, TimeOffResponse
)
from app.dependencies.auth import require_role

router = APIRouter(prefix="/barbers/me", tags=["Schedule"])

@router.get("/schedule", response_model=list[ScheduleResponse])
def get_my_schedule(
    db: Session = Depends(get_db),
    user = Depends(require_role("barber"))
):
    schedules = db.query(BarberSchedule).filter(
        BarberSchedule.barber_id == UUID(user["sub"])
    ).order_by(BarberSchedule.weekday).all()
    return schedules

@router.put("/schedule", response_model=list[ScheduleResponse])
def set_my_schedule(
    items: list[ScheduleItem],
    db: Session = Depends(get_db),
    user = Depends(require_role("barber"))
):
    barber_id = UUID(user["sub"])

    db.query(BarberSchedule).filter(
        BarberSchedule.barber_id == barber_id
    ).delete()

    for item in items:
        schedule = BarberSchedule(
            barber_id=barber_id,
            weekday=item.weekday,
            start_time=item.start_time,
            end_time=item.end_time,
            is_working_day=item.is_working_day
        )
        db.add(schedule)

    db.commit()

    schedules = db.query(BarberSchedule).filter(
        BarberSchedule.barber_id == barber_id
    ).order_by(BarberSchedule.weekday).all()
    return schedules

@router.get("/time-off", response_model=list[TimeOffResponse])
def get_my_time_off(
    db: Session = Depends(get_db),
    user = Depends(require_role("barber"))
):
    time_off = db.query(BarberTimeOff).filter(
        BarberTimeOff.barber_id == UUID(user["sub"])
    ).order_by(BarberTimeOff.start_date).all()
    return time_off

@router.post("/time-off", response_model=TimeOffResponse)
def add_time_off(
    data: TimeOffRequest,
    db: Session = Depends(get_db),
    user = Depends(require_role("barber"))
):
    if data.end_date < data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de fin no puede ser anterior a la de inicio"
        )

    time_off = BarberTimeOff(
        barber_id=UUID(user["sub"]),
        start_date=data.start_date,
        end_date=data.end_date,
        reason=data.reason
    )
    db.add(time_off)
    db.commit()
    db.refresh(time_off)
    return time_off

@router.delete("/time-off/{time_off_id}")
def delete_time_off(
    time_off_id: UUID,
    db: Session = Depends(get_db),
    user = Depends(require_role("barber"))
):
    time_off = db.query(BarberTimeOff).filter(
        BarberTimeOff.id == time_off_id,
        BarberTimeOff.barber_id == UUID(user["sub"])
    ).first()
    if not time_off:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Periodo de vacaciones no encontrado"
        )
    db.delete(time_off)
    db.commit()
    return {"message": "Periodo de vacaciones eliminado"}
