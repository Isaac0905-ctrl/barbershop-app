from pydantic import BaseModel

class AvailabilityResponse(BaseModel):
    barber_id: str
    date: str
    slots: list[str]
