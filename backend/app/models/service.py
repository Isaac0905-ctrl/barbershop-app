from sqlalchemy import Column, String, Boolean, Text, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

class Service(Base):
    __tablename__ = "services"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name         = Column(String(100), nullable=False)
    description  = Column(Text)
    price        = Column(Numeric(8, 2), nullable=False)
    duration_min = Column(Integer, nullable=False)
    is_active    = Column(Boolean, default=True, nullable=False)

    appointments = relationship("Appointment", back_populates="service")
