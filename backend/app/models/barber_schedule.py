from sqlalchemy import Column, Integer, Time, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

class BarberSchedule(Base):
    __tablename__ = "barber_schedules"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    barber_id       = Column(UUID(as_uuid=True), ForeignKey("barbers.id", ondelete="CASCADE"), nullable=False)
    weekday         = Column(Integer, nullable=False)  # 0=lunes ... 6=domingo
    start_time      = Column(Time, nullable=False)
    end_time        = Column(Time, nullable=False)
    is_working_day  = Column(Boolean, default=True, nullable=False)

    barber = relationship("Barber", back_populates="schedules")
