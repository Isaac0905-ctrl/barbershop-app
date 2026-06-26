from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models
from app.routes import services, barbers, auth, appointments, schedule

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Barbershop API",
    description="API para gestión de citas de peluquería",
    version="0.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(services.router)
app.include_router(barbers.router)
app.include_router(appointments.router)
app.include_router(schedule.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Barbershop API corriendo"}
