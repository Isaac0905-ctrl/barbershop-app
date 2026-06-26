from sqlalchemy import Column, String, Boolean, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

class Barber(Base):
    __tablename__ = "barbers"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name          = Column(String(100), nullable=False)
    email         = Column(String(150), nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    bio           = Column(Text)
    photo_url     = Column(Text)
    is_active     = Column(Boolean, default=True, nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    appointments = relationship("Appointment", back_populates="barber")
    schedules    = relationship("BarberSchedule", back_populates="barber", cascade="all, delete-orphan")
    time_off     = relationship("BarberTimeOff", back_populates="barber", cascade="all, delete-orphan")
