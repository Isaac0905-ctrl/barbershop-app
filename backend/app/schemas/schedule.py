from pydantic import BaseModel
from uuid import UUID
from datetime import time, date

class ScheduleItem(BaseModel):
    weekday: int
    start_time: time
    end_time: time
    is_working_day: bool = True

class ScheduleResponse(BaseModel):
    id: UUID
    barber_id: UUID
    weekday: int
    start_time: time
    end_time: time
    is_working_day: bool

    class Config:
        from_attributes = True

class TimeOffRequest(BaseModel):
    start_date: date
    end_date: date
    reason: str | None = None

class TimeOffResponse(BaseModel):
    id: UUID
    barber_id: UUID
    start_date: date
    end_date: date
    reason: str | None
    created_at: object

    class Config:
        from_attributes = True
