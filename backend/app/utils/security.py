from datetime import datetime, timedelta
from dotenv import load_dotenv
import bcrypt
import jwt
import os

load_dotenv()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=int(os.getenv("JWT_EXPIRE_MINUTES", 60)))
    payload.update({"exp": expire})
    return jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")

def decode_token(token: str) -> dict:
    return jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
