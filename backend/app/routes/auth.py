from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.client import Client
from app.models.barber import Barber
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.utils.security import hash_password, verify_password, create_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Client).filter(Client.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una cuenta con ese email"
        )
    client = Client(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password)
    )
    db.add(client)
    db.commit()
    db.refresh(client)

    token = create_token({
        "sub": str(client.id),
        "role": "client",
        "full_name": client.full_name
    })

    return TokenResponse(
        access_token=token,
        role="client",
        full_name=client.full_name
    )

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.email == data.email).first()
    if client and verify_password(data.password, client.password_hash):
        token = create_token({
            "sub": str(client.id),
            "role": "client",
            "full_name": client.full_name
        })
        return TokenResponse(
            access_token=token,
            role="client",
            full_name=client.full_name
        )

    barber = db.query(Barber).filter(Barber.email == data.email).first()
    if barber and verify_password(data.password, barber.password_hash):
        token = create_token({
            "sub": str(barber.id),
            "role": "barber",
            "full_name": barber.name
        })
        return TokenResponse(
            access_token=token,
            role="barber",
            full_name=barber.name
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email o contraseña incorrectos"
    )
