from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    barber_id           = Column(UUID(as_uuid=True), ForeignKey("barbers.id", ondelete="RESTRICT"), nullable=False)
    service_id          = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="RESTRICT"), nullable=False)
    client_id           = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    scheduled_at        = Column(DateTime(timezone=True), nullable=False)
    status              = Column(String(20), nullable=False, default="pending")
    notes               = Column(Text)
    cancellation_reason = Column(Text)
    cancelled_by        = Column(String(20))
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    barber  = relationship("Barber", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
    client  = relationship("Client", back_populates="appointments")
