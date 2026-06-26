from sqlalchemy import Column, Date, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

class BarberTimeOff(Base):
    __tablename__ = "barber_time_off"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    barber_id   = Column(UUID(as_uuid=True), ForeignKey("barbers.id", ondelete="CASCADE"), nullable=False)
    start_date  = Column(Date, nullable=False)
    end_date    = Column(Date, nullable=False)
    reason      = Column(Text)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    barber = relationship("Barber", back_populates="time_off")
