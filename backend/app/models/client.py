from sqlalchemy import Column, String, Boolean, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

class Client(Base):
    __tablename__ = "clients"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name      = Column(String(150), nullable=False)
    email          = Column(String(150), nullable=False, unique=True)
    phone          = Column(String(20))
    password_hash  = Column(Text)
    email_verified = Column(Boolean, default=False, nullable=False)
    provider       = Column(String(20), default='local', nullable=False)
    provider_id    = Column(Text)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    appointments = relationship("Appointment", back_populates="client")
