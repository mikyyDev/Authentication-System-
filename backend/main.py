import os
import random
import time
import logging
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from . import models, schemas, security
from .database import engine, get_db


verification_store: dict[str, dict[str, datetime | str]] = {}
rate_limit_store: dict[str, list[datetime]] = {}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger("auth-system")

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Autentication Sytem")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    started_at = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
    client_ip = request.client.host if request.client else "unknown"
    logger.info(
        "%s %s %s %sms ip=%s",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        client_ip,
    )
    return response


def _generate_otp_code() -> str:
    return str(random.randint(100000, 999999))


def _get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _enforce_rate_limit(request: Request, key: str, limit: int, window_seconds: int):
    now = datetime.utcnow()
    client_ip = _get_client_ip(request)
    store_key = f"{key}:{client_ip}"
    attempts = rate_limit_store.get(store_key, [])
    window_start = now - timedelta(seconds=window_seconds)
    recent_attempts = [attempt for attempt in attempts if attempt >= window_start]
    if len(recent_attempts) >= limit:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
        )
    recent_attempts.append(now)
    rate_limit_store[store_key] = recent_attempts


@app.get("/health", response_model=schemas.MessageResponse)
def health_check():
    return {"message": "ok"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        token_type = payload.get("token_type")
        if token_type and token_type != "access":
            raise credentials_exception
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = security.get_password_hash(user.password)
    new_user = models.User(name=user.name, email=user.email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(request: Request, user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    _enforce_rate_limit(
        request,
        key="login",
        limit=int(os.getenv("LOGIN_RATE_LIMIT", 5)),
        window_seconds=int(os.getenv("LOGIN_RATE_LIMIT_WINDOW_SECONDS", 60)),
    )
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    if not user or not security.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = security.create_access_token(data={"sub": user.email})
    refresh_token = security.create_refresh_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
    }


@app.post("/refresh", response_model=schemas.Token)
def refresh_token(payload: schemas.RefreshTokenRequest):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
    )
    try:
        token_payload = jwt.decode(
            payload.refresh_token,
            security.SECRET_KEY,
            algorithms=[security.ALGORITHM],
        )
        email: str = token_payload.get("sub")
        token_type: str = token_payload.get("token_type")
        if not email or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    new_access_token = security.create_access_token(data={"sub": email})
    new_refresh_token = security.create_refresh_token(data={"sub": email})
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token,
    }

@app.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.delete("/delete-account")
def delete_account(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}


@app.post("/send-code")
def send_code(request: Request, payload: schemas.SendCodeRequest, db: Session = Depends(get_db)):
    _enforce_rate_limit(
        request,
        key="send-code",
        limit=int(os.getenv("SEND_CODE_RATE_LIMIT", 3)),
        window_seconds=int(os.getenv("SEND_CODE_RATE_LIMIT_WINDOW_SECONDS", 300)),
    )

    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    code = _generate_otp_code()
    verification_store[payload.email] = {
        "code": code,
        "expires_at": datetime.utcnow() + timedelta(minutes=10),
    }
    return {
        "message": "Verification code generated (demo mode)",
        "code": code,
    }


@app.post("/verify")
def verify_code(request: schemas.VerifyEmail):
    entry = verification_store.get(request.email)
    if not entry:
        raise HTTPException(status_code=400, detail="Invalid code or email")

    if entry["code"] != request.code:
        raise HTTPException(status_code=400, detail="Invalid code or email")

    if datetime.utcnow() > entry["expires_at"]:
        verification_store.pop(request.email, None)
        raise HTTPException(status_code=400, detail="Verification code expired")

    verification_store.pop(request.email, None)
    return {"message": "Account verified successfully"}
