from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.barber import Barber
from app.schemas.barber import BarberResponse

router = APIRouter(prefix="/barbers", tags=["Barbers"])

@router.get("/", response_model=list[BarberResponse])
def get_barbers(db: Session = Depends(get_db)):
    barbers = db.query(Barber).filter(Barber.is_active == True).all()
    return barbers
